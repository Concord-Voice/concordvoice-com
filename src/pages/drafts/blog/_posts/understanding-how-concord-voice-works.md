---
title: "Understanding How Concord Voice Works"
description: "A guided tour of the three layers that move your voice, the control plane, the media plane, and the end-to-end lock wrapped around both."
pubDate: 2026-05-28
category: "Product"
tags: ["architecture", "encryption", "self-hosting"]
readingTime: 25
slug: "understanding-how-concord-voice-works"
---

When most people hear "privacy-focused communications platform," they either think of Signal (and its 2003-era UI), some sketchy app that got delisted from the app store, or yet another startup that'll pivot to selling your data within 18 months. Fair. The track record isn't great.

So instead of just *saying* Concord Voice is different, let's actually walk through how it works. No hand-waving, no "trust us, bro." Just the mechanics, explained in a way that hopefully doesn't require a computer science degree to follow.

There are three fundamental layers to understand: the **brain** (Control Plane), the **voice** (Media Plane), and the **lock** (End-to-End Encryption). Everything else is built on top of these.

## Layer 1: The Brain (Control Plane)

The Control Plane is the central nervous system of Concord Voice. It's a Go backend that handles basically everything *except* the actual audio and video streams. Think of it as the building manager for the entire platform.

When you create an account, join a server, send a text message, manage your friends list, or check who's online, all of that goes through the Control Plane. It manages:

**Authentication**, Logging you in, managing your sessions, making sure *you* are actually *you*. Your password is hashed with Argon2id (the current gold standard, not MD5, not SHA-256, not bcrypt; we went with the one that OWASP actually recommends). Sessions use short-lived JWT tokens (15 minutes) paired with longer-lived refresh tokens stored in HttpOnly cookies, so even if someone sniffs your traffic, they've got a very narrow window before that token is worthless.

**Servers and Channels**, "Servers" in Concord are communities. You create one, invite people, set up channels (text, voice, bulletin boards), organize them into categories, and manage who can do what. If you've used Discord, the concept is familiar, but the underlying architecture is... well, keep reading.

**Real-Time Signaling**, When someone sends a message in a channel, you see it instantly. That's WebSocket connections managed by the Control Plane. But here's a fun detail: WebSocket connections don't just use your normal authentication token. They use a single-use ticket that expires in 30 seconds. You request the ticket, you use it once, and it's gone. This prevents a whole class of token-theft attacks that other platforms are still vulnerable to (or just don't care about).

**Presence and Coordination**, Who's online, who just joined a voice channel, who's typing, all real-time, all flowing through here.

What the Control Plane *does not do* is touch your actual message content (if E2EE is enabled) or your voice/video streams. It's the postal service that knows where to deliver the letter, but never opens the envelope.

## Layer 2: The Voice (Media Plane)

This is where Concord gets fun, and arguably where it diverges the most from mainstream platforms.

The Media Plane is a Node.js service built on top of **mediasoup**, which is a Selective Forwarding Unit (SFU). That's a fancy way of saying: it routes audio and video packets between users *without ever mixing, transcoding, or touching the actual media data*.

Here's why that matters. Most voice platforms use one of two approaches:

**Peer-to-Peer (P2P):** Your audio goes directly to every other participant. Works great for 2 people. Falls apart spectacularly at 5+, because your upload bandwidth scales linearly with the number of participants (you're sending a separate copy of your audio to each person). Your laptop becomes a space heater.

**MCU (Multipoint Control Unit):** Everyone sends audio to a central server, the server *mixes all the streams together* into one combined audio stream, and sends that back to everyone. Efficient for bandwidth, but the server literally decodes, processes, and re-encodes your audio. If the server is compromised, so is your call. Also, latency increases because mixing takes time.

Concord uses **option 3: the SFU.** You send your audio once to the Media Plane. The Media Plane then *forwards* your encrypted packet, unchanged, untouched, un-decoded, to every other participant. Your audio is literally just being passed along, like handing a sealed envelope down a line of people. Nobody in the middle opens it.

This gives us:

**Low latency**, No mixing step. Packets arrive in roughly 50ms same-region, ~150ms cross-region.

**High quality** ; Seven quality tiers, from "I'm on satellite internet in Antarctica" (16 kbps) to "I'm recording a podcast and need studio quality" (510 kbps). Server admins can cap the quality per-channel if bandwidth is a concern.

**True E2EE compatibility** ; Because the server never decodes the audio, end-to-end encryption actually works for voice. More on that in a moment.

**Lower server costs** ; No CPU-intensive mixing or transcoding means the Media Plane can handle more users per machine.

The same approach applies to video and screen sharing. When you share your screen, it's encoded on your machine (using AV1, H.264, VP9, or VP8, depending on what your hardware supports) and forwarded to viewers through the SFU. The server never renders or processes your screen, it's just a relay.

### How Joining a Voice Channel Actually Works

For the curious, here's the step-by-step:

You click "Join" on a voice channel.

Your client asks the Control Plane, "Hey, can I join this channel?" The Control Plane checks your permissions, confirms you're allowed, and responds with the Media Plane's address and ICE server details (those are the STUN/TURN servers that help you punch through firewalls and NATs, the things that make WebRTC work in the real world, where everyone is behind a router).

Your client connects to the Media Plane via Socket.IO and says, "I'm here, put me in this room."

The Media Plane creates two WebRTC transports for you: one for sending (your microphone) and one for receiving (everyone else's audio).

Your microphone audio gets encoded with the Opus codec (which is legitimately incredible at compression and quality, and is also open source), encrypted, and shipped to the Media Plane.

The Media Plane forwards your encrypted audio to everyone else's receiving transports.

Their clients decrypt and play it.

The symmetry is clean: you send once, everyone else receives. Nobody's machine is doing more work just because there are more people in the call.

## Layer 3: The Lock (End-to-End Encryption)

Here's where Concord's "privacy-first" claim actually has to put up or shut up.

End-to-End Encryption means that your messages and calls are encrypted *on your device* before they ever leave it, and can only be decrypted *by the intended recipients*. The servers in between, whether it's our cloud, your self-hosted instance, or anything in the network path, see nothing but scrambled data. Not metadata about what you said, not the content, not even the length of the original message (it's padded).

### How E2EE Works in Concord

When you create an account, your client generates an RSA-4096 key pair. That's a mathematically linked public key and private key (you use one to encrypt, the other to decrypt; one can’t be used for both at the same time, like encrypt with public, decrypt the same thing with public). Your public key gets uploaded to the server (this is fine, it's *public*). Your private key gets wrapped (encrypted) with a key derived from your password using Argon2id (the same algorithm we use server-side) and stored locally in your OS keychain (macOS Keychain, Windows DPAPI, or Linux libsecret). It never leaves your device unencrypted. Ever. If you forget your password, you can recover your account, but we can't help you recover the key without supplemental methods (more on that below). That's not a bug; that's the point.

When a channel is created, the creator generates a random AES-256-GCM symmetric key (the Channel Symmetric Key, or CSK). This is the key that actually encrypts and decrypts messages in the channel. The creator wraps (encrypts) this CSK with their own public key and stores the wrapped version on the server.

When you're invited to the channel, the creator (or someone with the key) fetches your public key, wraps a copy of the CSK with *your* public key, and sends that wrapped copy to you via the server. Your client unwraps it with your private key, and now you can read and write in the channel. The server only ever sees wrapped (encrypted) copies of the CSK, it can't use them without your private key, which it doesn't have.

For voice calls, the same principle applies but uses the WebRTC Insertable Streams API, which lets us encrypt media frames *after* encoding but *before* they hit the network. The Media Plane forwards packets it literally cannot decrypt.

When someone leaves or is removed from a channel, the keys get rotated. New CSK is generated, re-wrapped for all remaining members, and the old key is versioned so you can still decrypt past messages you were part of, but the removed member can't decrypt anything new. This is something called Forward secrecy.

### What This Means in Practice

If our servers got breached tomorrow (or if a government showed up with a warrant, or if a rogue employee went snooping), they'd find:

Encrypted blobs of message data they can't read

Wrapped symmetric keys they can't unwrap

Public keys (which are, by definition, *public*)

Your username and email (yes, we know those; we need *something* to identify your account)

They would *not* find:

Your message content

Your call audio or video

Your private encryption keys

Your password (it's hashed with Argon2id; even we don't know it)

Biometric data, location data, or any of the other things platforms love to quietly collect

### But What if I Forget My Password?

This is the part where most E2EE platforms shrug and say "sorry." We didn't love that answer.

The fundamental problem: your private key is wrapped with a key derived from your password. No password, no private key. No private key, no decrypting your messages. Math doesn't care about your feelings.

But there are ways to solve this without compromising the encryption model. We implemented three:

**Recovery Key.** When you create your account, you're offered a recovery key, a base58-encoded string (looks like a long serial number with dashes). This key independently wraps a separate copy of your private key using its own Argon2id-derived encryption key, with a unique salt. You store this key somewhere safe: a password manager, a piece of paper in a drawer (*probably shouldn’t*), whatever works. If you lose your password, you enter the recovery key, it unwraps your private key, and you set a new password. Your encrypted message history is fully preserved. We never see the recovery key. It's generated on your device and never transmitted.

**Trusted Device Recovery.** If you're still logged in on another device (say, your desktop), you can approve a recovery request from that device. Here's how it works under the hood: the recovering device generates a temporary ECDH key pair and sends the public half to the server. Your trusted device gets notified, generates its own ECDH key pair, and the two devices perform a Diffie-Hellman key exchange to derive a shared secret that the server never knows. The trusted device then encrypts your raw private key with that shared secret and sends it over. The recovering device decrypts it, you set a new password, and you're back in. The server only ever sees encrypted blobs moving between the two devices.

**Recovery Circle (Social Recovery).** This one's our favorite. You pick 3 to 7 trusted friends on the platform and create a Recovery Circle. Behind the scenes, your private key is split using Shamir's Secret Sharing, a cryptographic technique where the key is divided into multiple "shares," and you need a minimum threshold (say, 3 out of 5) to reconstruct the original. Each friend's share is encrypted with their public key, so even they can't see it in plaintext, it's just an opaque blob sitting on the server tied to their account. If you need to recover, you initiate a social recovery request. Your friends get notified, approve the request, and their shares are sent back to you encrypted via ECDH (same ephemeral key exchange as trusted device recovery). Once enough friends respond and you hit the threshold, the shares are recombined, your private key is reconstructed on your device, and you set a new password. No single friend ever has enough information to reconstruct your key on their own. The server never sees any plaintext shares.

**And if none of those work?** Account reset. You get a new key pair, your account, servers, friends, and settings are preserved, but all past encrypted message history is permanently gone. We make you acknowledge this explicitly before proceeding; a checkbox, a warning banner, the works. It's the nuclear option, and it's there because sometimes life happens.

The point is: we built a system where *you* have multiple paths to recover your account without *us* ever being one of those paths. We can't help you recover your key because we genuinely do not have it, but we gave you the tools to help yourself.

## What About Everything Else? (Metadata and the Stuff Encryption Doesn't Cover)

Here's where most "privacy-focused" platforms stop talking. They'll spend 45 minutes explaining how messages are end-to-end encrypted and then go suspiciously quiet about everything *around* those messages. Because here's the uncomfortable truth about E2EE: encrypting the message content is only half the problem. The *metadata*, who you talk to, when, how often, from where, what your settings are, which servers you're in, can be just as revealing as the messages themselves. Intelligence agencies have publicly stated they can work with metadata alone. So let's talk about what we've done about it, and where we're still working on it.

### Your Settings Are Encrypted Too

This one surprises people. When you configure your theme, font size, layout preferences, server folder organization, or compact mode, all of that gets encrypted on your device using AES-256-GCM with a domain-separated Argon2id-derived key before being synced to the server. "Domain-separated" means we derive a *different* encryption key for your preferences than the one used to wrap your private key, even though both come from your password. This is a deliberate cryptographic hygiene measure: compromising one key doesn't compromise the other.

The server stores your preferences as an opaque, encrypted blob. It can sync that blob between your devices, but it cannot read it. It doesn't know your theme, your layout, your folder structure, nothing. This matters because preferences are contextual metadata, your notification settings, your muted servers, and how you organize your communities paint a picture of how you use the platform, and that's nobody's business but yours.

### Privacy Controls That Actually Do Something

We built a granular privacy settings system that's enforced server-side, not just client-side cosmetics:

**DM Privacy Levels (0–3):** You control who can initiate direct messages with you. Level 0 is completely off, nobody can DM you. Level 1 is friends only. Level 2 (the default) is friends and people who share a server with you. Level 3 is open to all. There is also a toggle to allow ‘Friends of Friends’ for Level 1 and Level 2 (it’s turned off on Level 0 and on with Level 3 by default). These aren't suggestions; the server checks your privacy settings before allowing anyone to open a conversation with you and returns a hard 403 if they don't qualify.

**Discoverability:** By default, you are *not* searchable by username, email, or phone number. All three are toggled off out of the box. You opt *in* to being discoverable, not out. This is the opposite of what most platforms do, where you have to go digging through settings to turn off "let people find me by my phone number" after they've already indexed it.

**Invisible Mode:** You can set your status to invisible, which makes you appear offline to everyone else while you continue to use the platform normally. The server enforces this: Invisible users are excluded from presence broadcasts, online counts, and doesn’t appear differently via API fetches (it just returns offline).

**Embedded Content:** By default, Concord Voice does not allow embedded content to render on the client. This means any URLs and such that are external to the platform will not render any prefetch visualizations of the content. This helps users avoid ‘beaconing’ to third-party sites and reduces potential exposure to actors with malicious intent (which can expose IP addresses, device information, client info, etc.). This permission is enforced per user, and having it set to off will always win over it being set to Allow. Server admins can also enforce this setting across servers, though if it is set to allow, users with it off will still enforce that permission locally on their client, ignoring the server signal.

### What the Server Can't See

Let's be explicit, because vague privacy claims are worthless:

**Message content** ; Encrypted client-side. The server stores ciphertext.

**DM content** ; All DMs are encrypted by default. The server enforces this; it literally rejects plaintext messages sent to encrypted conversations.

**Your preferences and settings** ; Encrypted blob. The server can't decrypt it.

**Your private encryption keys** ; Wrapped with your password-derived key, stored on your device. The server only has the wrapped version, which it can't unwrap.

**Your password** ; Hashed with Argon2id. We don't have it; we have a one-way hash of it.

**Your date of birth, IP address, timezone, or geolocation during age verification** ; Processed locally on your client, never transmitted. Only the resulting boolean flags leave your machine. (Curious? See [this article](/blog/age-verification-and-right-to-privacy) about age verification.)

### What the Server Can See

We're not going to pretend the server is completely blind. It isn't. Here's what it knows:

**Your username and email**, We need *something* to identify your account.

**Who you're friends with and which servers you're in**, Necessary for routing messages and enforcing privacy settings. We can't check "is this person your friend?" without knowing who your friends are.

**When you're online** ; Presence is tracked in Redis with a 120-second TTL for real-time status. We need this for the "who's online" indicators.

**Message timestamps and sender IDs**, The server needs to know *who* sent a message and *when* to deliver it in the right order, even though it can't read *what* was sent.

**Voice channel participation** ; The server knows who is in which voice channel. It has to in order to coordinate media routing.

**Session metadata** ; IP address, user agent, and device name are stored with your session for token theft detection. This is a security-vs-privacy tradeoff: machine ID comparison is how we detect if someone steals your refresh token and tries to use it from a different device.

The honest framing: Concord is a *hybrid* zero-knowledge system. Content is zero-knowledge (we can't read it). Metadata is *minimized* but not zero (we need some of it to make the platform function). The question isn't "does the server know anything?", it's "does the server know the *minimum* necessary to function, and nothing more?" That's the bar we're trying to hit.

### If It Doesn't Need to Exist, It Shouldn't

One of the principles we follow is: if data doesn't need to persist, it shouldn't. A surprising amount of what happens on a communications platform is *ephemeral*, where it only matters for a few seconds or minutes, and storing it beyond that is a liability, not a feature. So we designed many of Concord Voice’s data flows to be intentionally short-lived (sometimes for as little as microseconds).

**Typing indicators **are the clearest example. When you see "Alex is typing..." in a channel, that's a fire-and-forget WebSocket event. It's broadcast to the other people in the channel, rendered in their UI, and then it's gone. It is never written to a database, never logged, never cached. If the recipient's client misses it (say, they disconnected for a second), it's simply lost. There's no retry, no acknowledgment, no audit trail. We could store typing activity (some platforms do for analytics), but we don't, because there's no legitimate reason to, and it's one more thing that could be subpoenaed or breached.

**Mentions using the ‘@’ tagging system** use an *addendum* that’s pinned to the original message and obfuscated with encoding (still encrypted on the wire). They’re transmitted to the server for contextual routing and to engage push notifications for users tagged in a message; then the addendum is dropped in microseconds after decoding for message routing, never being logged to the server. The recipients never receive the actual addendum itself; only the sender and server knew it ever existed, and it falls out of scope once it is processed. The recipients who were tagged simply receive a message with a tagged flag attached.

**Presence status** (who's online) lives in Redis with a 120-second TTL. Your client sends a heartbeat, and the TTL refreshes. If your client crashes or loses connection, the key expires automatically in 2 minutes, and you go offline. A background cleanup job also sweeps for any stale presence keys that outlived their TTL. When you disconnect, your presence key is immediately deleted, not marked as "offline," *deleted*. The only thing that remains is a last_seen timestamp, so the platform can display "last seen 3 hours ago" for friends.

**WebSocket authentication tickets** live for 30 seconds. You request one, use it once, and it's atomically consumed via a Redis Lua script (GET and DELETE in a single operation; no race-condition window). If it's not used in 30 seconds, it evaporates.

**Email verification codes and account recovery codes** have a 10-minute TTL and are stored as SHA-256 hashes, not plaintext. Even if someone dumped the Redis cache, they'd get hashes that can't be reversed into usable codes. On successful verification, the entry is explicitly deleted (it doesn't wait for the TTL).

**MFA challenges** expire in 2 minutes. If you don't complete the challenge in that window, the session is gone, and you start over.

**NATS** (our inter-service message broker) runs in pure pub/sub mode. There is no persistence, no replay, no message history. Voice events, such as "user joined channel," flow through NATS from the Media Plane to the Control Plane, are processed, and then vanish. If the Control Plane is briefly down, those messages are simply lost, and the next heartbeat from the Media Plane reconciles the state.

On the client side, the same principle applies. **Age verification data**, your date of birth, IP-based geolocation inference, timezone, is processed entirely in your client's memory. The client computes two boolean flags (valid_age, nsfw_auth), signs them, and sends only those flags to the server. The raw data is never written to disk or transmitted, and falls out of scope as soon as the computation is complete.

**Decrypted messages** exist only in memory for display. There's no local cache of plaintext messages. If you scroll back up in a channel, those messages are re-fetched from the server (as ciphertext) and re-decrypted in real-time. Close the app, and the plaintext is gone.

**Channel encryption keys** are session-scoped. They live in memory as non-extractable CryptoKey objects for the duration of your session. Log out, and they're gone. Next login, they're re-fetched from the server (as RSA-wrapped blobs) and re-unwrapped with your private key.

**ECDH ephemeral key pairs** used during trusted device recovery or social recovery exist for the duration of a single key exchange, typically a few seconds, and then fall out of scope.

The general philosophy: data that exists for a moment should only *exist* for a moment. Every piece of data that lingers is vulnerable to compromise, subpoena, or accidental leak. Short TTLs, atomic deletion, and fire-and-forget patterns aren't just good engineering, they're a privacy strategy.

### Obfuscation: Hardening Data That Is Plaintext

Even for data that *does* need to persist, we apply layers of obfuscation so that raw sensitive values aren't sitting in databases or flying over API responses in plaintext.

**Refresh tokens are never stored raw.** When you log in and receive a refresh token, the server immediately SHA-256 hashes it before writing to the database. The plaintext token is sent to you once and never stored on our end. Every subsequent validation compares hashes, not tokens. If someone dumps the refresh_tokens table, they get a pile of irreversible hashes. The token hash field is also tagged json:"-" in the codebase, a defense-in-depth measure that prevents it from ever accidentally appearing in an API response, even if a developer makes a serialization mistake.

**Verification codes get the same treatment.** Email verification codes and recovery codes are SHA-256 hashed before being stored in Redis, and validated using constant-time comparison to prevent timing attacks. Even a Redis breach yields nothing usable.

**IP addresses are masked in API responses.** When you view your active sessions, the IP address you see is partially obscured: for IPv4, the last octet is replaced (e.g., 192.168.1.x); for IPv6, everything beyond the /48 prefix is masked. The raw IP *is* stored in the database for security audit purposes (we need it to detect suspicious login patterns and token theft), but it's never exposed to you or other users in its full form.

**Your profile has two faces.** The API uses explicit allowlist methods to construct responses, not "dump the database row and hope for the best." When *you* request your own profile, you get one projection (PublicUser): your email, username, display name, avatar, settings. When *someone else* views your profile, they get a different, smaller projection (ProfileForOthers): username, display name, avatar, color scheme. No email, no verification status, no internal fields. Sensitive fields like password_hash carry json:"-" tags as a second safety net, so even if someone accidentally returns the raw model, the hash is silently dropped from serialization.

**All identifiers are UUIDs.** User IDs, channel IDs, server IDs, token IDs, all UUID v4. No sequential integers, no auto-increment counters. You can't scrape user 1, user 2, and user 3 to enumerate accounts. Each ID is a random 128-bit value with no relationship to creation order or any other metadata.

**Friend codes are opaque.** When you want to add someone as a friend, you exchange 8-character random codes, not usernames. The codes use a safe character set (ambiguous characters like I, l, O, 0 are excluded to avoid confusion) and are generated with cryptographic randomness. A friend code reveals nothing about the user behind it.

**Machine IDs are random UUIDs**, not hardware fingerprints. Generated once per app installation using Node's cryptographic randomUUID(), stored locally, and used solely for token theft detection. It's not a hash of your MAC address or serial number, it's just entropy, tied to nothing identifiable about your hardware.

**Uploaded images are re-encoded from raw pixels.** When you upload an avatar or banner image, the server decodes it to raw pixel data, resizes it, and re-encodes it as a fresh JPEG or PNG. This process *automatically strips all EXIF, IPTC, and XMP metadata*, GPS coordinates, camera model, software version, timestamps, everything. The output image is synthesized from scratch; no bytes from the original file are preserved, except for the visual content itself.

**Error messages are generic.** API errors return messages like "Failed to create account" or "Authentication required", never SQL error details, stack traces, table names, or internal state. Detailed errors are logged server-side for debugging, but the client only ever sees a human-readable summary that reveals nothing about the system's internals.

### Anti-Fingerprinting and Session Hardening

A few more details for the security-conscious:

**WebSocket tickets** expire in 30 seconds and are single-use. Your authentication token never appears in a WebSocket URL (a common vulnerability in other platforms where tokens end up in server logs and browser history).

**Token theft detection** uses your device's machine ID (which we calculate using system information). If a refresh token is suddenly used from a different machine after a 30-second grace period, the system flags it as suspected theft and triggers additional verification.

**Username changes** have a one-year cooldown. This prevents identity cycling, where someone changes their username repeatedly to evade blocks or impersonate others.

**Custom headers are validated** before reaching any handler. X-Machine-Id must be a valid UUID format, X-Device-Name must be a valid UTF-8 string under 255 characters with no control characters. Malformed inputs are rejected at the middleware layer.

**Keys in memory are opaque.** We use the Web Crypto API's CryptoKey objects, which are non-extractable by default. Even if malicious JavaScript somehow ran in the renderer (XSS), it couldn't read the raw key material from these objects, as the browser's crypto subsystem protects them.

## The Hybrid Model: SaaS + Self-Hosted

Most platforms give you a binary choice: use our cloud, or go home. Concord gives you three options:

**Use our cloud (**[**concordvoice.chat**](https://concordvoice.chat)**)**, Sign up, start chatting. We host the infrastructure, manage updates, and handle the operational overhead. Your messages are still E2EE. We can't read them. You just don't have to think about servers.

**Self-host**, Deploy Concord on your own hardware. Docker Compose on a single VM, Kubernetes if you're feeling ambitious. You control the database, the network, the storage, everything. We receive *nothing* from your self-hosted instance. For personal or non-commercial use, it's free. Businesses need a commercial license.

**Hybrid**, This is the interesting one. A user with a Concord cloud account can participate in *both* cloud-hosted servers and self-hosted servers. One identity, multiple communities, across different infrastructures. Your client connects to one server at a time (no simultaneous multi-server connections, that's a deliberate security choice to prevent state leakage between trust boundaries), but you can switch between them.

The self-hosted option isn't just a checkbox feature. The entire codebase is source-available under the Concord Voice Source License (CVSL), which means you can read every line of code, audit it, modify it for your own use, and after 4 years, each version becomes fully open source under AGPL-3.0. If we disappear tomorrow, the code doesn't go with us.

This is also how we handle the families-and-kids situation mentioned in the age verification post. Self-hosted servers with local accounts that don't sync to the Concord Voice Network give parents and tech-savvy families a way to run their own private communications infrastructure, completely outside the bounds of our policies, age verification requirements, and network restrictions. It's your server, your rules.

## What Sits Underneath All of This

For the infrastructure-curious (skip this section if your eyes glaze over at the word "PostgreSQL"):

**Database:** PostgreSQL. Your account data, server structures, channel configurations, encrypted message history, and key metadata, all stored here. Self-hosted users control their own database entirely.

**Cache:** Redis. Session tracking, rate limiting (per-IP, per-user, per-WebSocket; we're not just slapping a global rate limit on and calling it a day), presence data, and pub/sub for real-time events.

**Message Broker:** NATS. Handles inter-service communication between the Control Plane and Media Plane. When you join a voice channel, the Control Plane tells the Media Plane via NATS. Lightweight, fast, and handles the distributed coordination for multi-instance deployments.

**Object Storage:** MinIO (S3-compatible). File uploads, profile images, media clips. All of this data is also encrypted, so we don’t see it either.

**STUN/TURN (coturn):** The NAT traversal servers that make WebRTC work behind firewalls. STUN helps your client discover its public address; TURN relays traffic when direct connections aren't possible (like behind corporate firewalls or symmetric NATs).

Transport security is TLS 1.3 for HTTP and WebSocket signaling, DTLS + SRTP for WebRTC media transport, and E2EE on top of all of that at the application layer. Belt and suspenders… and a second belt.

## So, Why Does Any of This Matter?

Look, we get it. Most people don't care about SFUs versus MCUs or the difference between AES-256-GCM and AES-256-CBC. And honestly? You shouldn't have to. The whole point of building this stuff correctly is so that you, the user, never have to think about it.

But here's the thing: the reason you *should* understand how your communications platform works, at least at a high level, is because it's the only way to evaluate whether the promises being made to you are actually possible. When a platform says "your data is secure" but uses an MCU that decodes your voice server-side, those two statements are in direct conflict. When a platform says "we don't read your messages" but doesn't implement E2EE, that's a *policy* promise, not a *technical* guarantee, and policies change with leadership, acquisition, or a particularly persuasive legal department.

Concord Voice is built so that the privacy guarantees are *architectural*. We can't read your messages, not because we promise not to, but because we *literally do not have the keys*. We can't listen to your calls, not because it's against our policy, but because the Media Plane *cannot decrypt the audio streams it forwards*.

These aren't policy decisions that the next CEO can reverse in a board meeting. They're mathematical constraints baked into the design.

That's the difference. And that's why we think it's worth understanding.
