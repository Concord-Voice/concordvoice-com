---
title: "Why Is End-to-End Encryption Important?"
description: "If a platform can read your messages, it can be made to hand them over. Why end-to-end encryption is the floor for private communication, not a feature."
pubDate: 2026-05-20
category: "Privacy"
tags: ["encryption", "privacy", "security"]
readingTime: 13
slug: "why-is-end-to-end-encryption-important"
---

If you've ever used iMessage, WhatsApp, or Signal, you've used End-to-End Encryption (E2EE), whether you knew it or not. It's the reason your messages can't be read by Apple, Meta, or the Signal Foundation while they're in transit or stored on their servers. It's a foundational technology for private communication, and increasingly, it's under attack from the very institutions that are supposed to protect your rights.

To understand why E2EE matters, you need to understand what happens without it.

## Your Government Is Reading Your Mail

Let's be blunt: mass surveillance is not a conspiracy theory. It's a documented, funded, ongoing program in most Western democracies. Edward Snowden revealed PRISM in 2013, and if you think anything changed after the public outrage, I'd encourage you to look at what's happened since.

Section 702 of FISA (the Foreign Intelligence Surveillance Act) allows U.S. intelligence agencies to collect communications from non-U.S. persons abroad. Sounds reasonable on paper, until you realize that "incidental collection" sweeps up enormous volumes of domestic communications too. If you email, message, or call someone who is a foreign target (or who communicated with a foreign target, or whose communications were routed through infrastructure that touches a foreign target…), your data is in the pile. No warrant required.

The UK's Investigatory Powers Act, affectionately nicknamed the "Snoopers' Charter," requires ISPs to retain browsing histories for 12 months and grants intelligence agencies bulk data collection powers. Australia's Assistance and Access Act of 2018 (the "Anti-Encryption Act") goes further: it can compel companies to build backdoors into encrypted systems, under penalty of law, and includes gag orders to prevent them from telling you about it.

The EU isn't immune either. The proposed "Chat Control" regulation (formally the CSA Regulation) would require platforms to scan all private messages, including encrypted ones, for CSAM. The goal is legitimate, but the mechanism requires breaking E2EE by design. You cannot scan encrypted content without either decrypting it server-side or installing client-side scanning that reports to a central authority. Both defeat the purpose entirely.

The pattern is always the same: invoke child safety or national security (legitimate concerns, most of the time), propose a mechanism that requires breaking encryption for everyone (disproportionate response), and then act surprised when civil liberties organizations point out that a backdoor for the government is a backdoor for everyone. Even worse, they’ve just started [buying data from private entities](https://www.npr.org/2026/03/25/nx-s1-5752369/ice-surveillance-data-brokers-congress-anthropic) to further expand surveillance capabilities; again, all without a warrant.

Here's the thing about backdoors: they don't check ID. A vulnerability built for the FBI is a vulnerability available to the FSB, the MSS, and every sufficiently motivated criminal organization on the planet (‘if there’s a will, there’s a way’ theory). You do not get to build a door that only the "good guys" can walk through. *That is not how math works.*

## Corporate Surveillance (the One You Agreed To)

Governments at least have to pretend there's a legal framework. Corporations just put it in the Terms of Service.

Most platforms that offer "free" communication are monetizing the content of that communication, directly or indirectly. [Gmail scans your emails](https://www.malwarebytes.com/blog/news/2025/11/gmail-is-reading-your-emails-and-attachments-to-train-its-ai-unless-you-turn-it-off) (they stopped using it for ads in 2017, but the scanning infrastructure never went away; it just powers "smart" features now). Facebook Messenger, until its recent encryption rollout, stored messages in plaintext on Meta's servers, accessible to Meta employees and, by extension, to any government that asked nicely or served a subpoena. [Instagram is removing E2EE entirely later this year.](https://www.theguardian.com/technology/2026/mar/18/instagram-to-remove-end-to-end-encryption-for-private-messages-in-may)

And since we're in the same space, let's be transparent about the competition. Many of the big community and voice platforms now encrypt voice and video calls, but not your messages or files, which stay accessible on their servers. Their privacy policies typically state they may share data with law enforcement "to comply with legal obligations." This isn't an accusation; it's just how that architecture works. When your messages aren't end-to-end encrypted, the platform can read them, and if the platform can read them, the platform can be compelled to hand them over.

And here's where it gets insidious: **corporations regularly hand over user data to governments without a warrant.** Emergency Data Requests (EDRs) allow law enforcement to bypass the warrant process by claiming an emergency, such as an imminent threat to life. Companies comply voluntarily because they don't want to be the company that didn't cooperate when someone got hurt. Reasonable in genuine emergencies. The problem? EDR abuse is rampant. In 2022, it was revealed that [hackers had been impersonating law enforcement officials](https://www.theverge.com/2022/3/30/23003600/apple-meta-shared-data-hackers-pretending-law-enforcement-officials) to submit fraudulent EDRs to Apple, Google, Meta, and others, and the companies complied, handing over user data including IP addresses, phone numbers, and home addresses. No warrant. No judge. Just a convincing-looking email from a compromised law enforcement account.

When your platform stores your data in plaintext (or in a format they can decrypt), this is the pipeline: your messages sit on their servers → government sends a request (formal or informal) → company complies → your private conversations are now in a government database. E2EE breaks this pipeline at the first step. If the platform can't decrypt your messages, there's nothing useful to hand over.

## The Analytics and Advertising Machine

Even when your data isn't being handed to a government, it's being fed into the analytics machine. Communication metadata, who you talk to, when, how often, for how long, [is extraordinarily valuable for building behavioral profiles](https://medium.com/integritee/metadata-in-messaging-how-it-works-and-why-you-should-be-wary-of-it-9e4a7e89fed2). You don't need to read the content of someone's messages to know they're job hunting (suddenly messaging recruiters on LinkedIn at odd hours), going through a divorce (communication pattern shift with a specific contact), or struggling with addiction (messaging patterns correlated with support group schedules).

This metadata gets packaged, anonymized (often poorly; re-identification from "anonymous" datasets is trivially easy with as few as 4 data points), and sold to data brokers who sell it to advertisers who serve you targeted ads for divorce lawyers and rehab centers. The "anonymous" dataset that somehow knows you need both.

And now, in 2026, this data is being fed into AI training sets. Your conversations, your patterns, your relationships, all grist for the model. The irony of an AI trained on private communications being used to generate "personalized" content is not lost on us.

## Privacy vs. Security: They're Not Opposites

There's a persistent narrative, mostly pushed by surveillance advocates, that privacy and security are in tension with one another. That you have to sacrifice one for the other. "If you have nothing to hide, you have nothing to fear." This is, respectfully, f\*\*king nonsense.

Privacy *is* security. The ability to communicate privately is what allows journalists to protect sources, lawyers to maintain attorney-client privilege, activists to organize under authoritarian regimes, domestic abuse victims to seek help without their abuser monitoring their messages, and businesses to discuss trade secrets without competitors listening in.

The recent Proton Mail situation is a useful case study. In late 2024 and into 2025, it came to light that Proton AG, the company behind ProtonMail, the encrypted email provider, had complied with legal requests to hand over metadata about users to law enforcement authorities. Not email content (that's E2EE and Proton genuinely can't decrypt it), but metadata: IP addresses, account creation dates, recovery email addresses.

Proton was transparent about this: Swiss law requires them to comply with valid Swiss court orders, and their architecture means they *can't* hand over message content even if they wanted to. But the metadata was enough. In at least one case, it was used to identify and arrest a climate activist.

This is the critical lesson: **E2EE protects content, but metadata is the other half of the equation.** Knowing that you messaged someone at 2 AM doesn't require reading the message. Knowing that a journalist contacted a government whistleblower doesn't require reading what was said. The metadata *is* the story.

This is why serious privacy engineering isn't just about encrypting the payload, it's about minimizing, obfuscating, and expiring the metadata around it. Encryption is necessary, but not sufficient.

## How Concord Voice Approaches This

We took three positions when designing Concord Voice's encryption and privacy model:

**The server should not be able to read your messages.** This is non-negotiable and foundational to the architecture.

**The server should know as little about you as possible.** Metadata is a liability, not an asset.

**Data that doesn't need to exist shouldn't.** Every piece of data that lingers is vulnerable to compromise, subpoena, or leak.

### Your Messages Are Encrypted Before They Leave Your Device

Concord uses channel-level E2EE with AES-256-GCM symmetric encryption and RSA-4096 key wrapping. Here's what that means in human terms:

When a channel is created, the creator's client generates a random encryption key (the Channel Symmetric Key, or CSK). This key is what actually encrypts and decrypts messages. To share it with other channel members, it's wrapped (encrypted) with each member's RSA-4096 public key, meaning only their corresponding private key can unwrap it.

Your private key never leaves your device. It's generated locally when you create your account, wrapped with a key derived from your password using Argon2id (a memory-hard key derivation function that makes brute-force attacks extraordinarily expensive, 64 MB of RAM per attempt, 3 iterations, 4 parallel threads), and stored encrypted. Even the wrapped private key stored on the server is useless without your password.

When you send a message, your client encrypts it with the channel's symmetric key, and the server receives ciphertext, gibberish it can't decode. When someone in the channel loads that message, their client decrypts it locally. The server is a dumb pipe for encrypted blobs. It routes them, stores them, and has no idea what's inside.

Voice works the same way. Audio is encrypted at the WebRTC Insertable Streams level before it hits the Media Plane (our voice routing server). The Media Plane is a Selective Forwarding Unit, it forwards encrypted packets between participants without decoding them. It literally cannot listen to your calls. It doesn't have the keys.

### Metadata Minimization: The Other Half

We learned from Proton's situation. Encrypting message content is step one. Step two is treating metadata like radioactive material: minimize exposure, contain what you must keep, and dispose of the rest as fast as possible.

**Your settings are encrypted too.** User preferences, themes, layout, folder organization, are encrypted client-side with AES-256-GCM using a domain-separated key (derived independently from the one that wraps your private key, so compromising one doesn't compromise the other) before being synced to the server. The server stores an opaque blob. Your UI preferences are nobody's business.

**Ephemeral by default.** Typing indicators ("Alex is typing...") are fire-and-forget WebSocket events. They're broadcast to the channel, rendered in the UI, and gone. Never written to a database, never logged, never cached. Presence status (online/offline) lives in Redis with a 120-second TTL. If your client crashes, you automatically go offline when the key expires. There's no permanent "activity log" of when you were online.

WebSocket authentication tickets live for 30 seconds and are atomically consumed on use (a Redis Lua script that GETs and DELETEs in one operation, no race condition window). Email verification codes and recovery codes are SHA-256 hashed before storage and auto-expire in 10 minutes. MFA challenges expire in 2 minutes. Our inter-service message broker (NATS) runs in pure pub/sub mode with no message persistence or replay capability. If a message passes through, it's gone.

**What the server sees is obfuscated.** Refresh tokens are SHA-256 hashed before being stored in the database, the plaintext token is sent to you once and never stored on our end. IP addresses are stored for security audit purposes (token theft detection) but are masked when returned in API responses: the last octet is replaced for IPv4 (192.168.1.x), and everything beyond the /48 prefix is masked for IPv6. Verification codes are hashed with SHA-256 and compared using constant-time operations (preventing timing side-channel attacks). All identifiers (user IDs, channel IDs, server IDs) are UUID v4, random 128-bit values with no sequential relationship. You can't enumerate users by incrementing an ID.

**Uploaded public images are stripped of metadata.** When you upload an avatar or banner for your profile or a server profile, the server decodes it to raw pixel data, resizes it, and re-encodes it as a fresh image. Every byte of EXIF, IPTC, and XMP metadata, GPS coordinates, camera model, software version, timestamps, is destroyed in the process. Only the visual content survives. Files in messages are always encrypted end-to-end, so we can never see those, even if they have metadata.

**Friend discovery uses opaque codes, not usernames.** To add someone, you exchange 8-character random codes generated with cryptographic randomness. The code reveals nothing about the user behind it. No username enumeration, no identity exposure.

**Profiles have two faces.** When you view your own profile via the API, you see one projection. When someone else views you, they see a smaller one, no email, no verification status, no internal fields. Sensitive fields carry json:"-" tags as defense-in-depth, meaning even a developer serialization mistake can't accidentally leak them.

**Decrypted messages only exist in memory.** There's no local plaintext message cache. Scroll up in a channel, and those messages are re-fetched as ciphertext and re-decrypted in real-time. Close the app, and the plaintext is gone. Channel encryption keys are session-scoped, non-extractable CryptoKey objects: log out, and they're gone too.

### Account Recovery without Sacrificing Encryption

One of the hardest problems in E2EE is: what happens when you lose your password? If the server can't decrypt your data, and your private key is wrapped with your password, then losing your password means losing everything. Most platforms solve this by... not actually doing E2EE, or by holding a recovery key on the server (which defeats the purpose).

We implemented three recovery strategies that preserve E2EE:

**Recovery Key.** During account setup, a 32-byte random recovery key is generated, Base58-encoded for human readability, and used to independently wrap your private key with a separate salt. You write it down or store it in a password/secrets manager (don’t store it out in the open if you can help it!) If you lose your password, the recovery key can unwrap your private key, and you re-wrap it with your new password. The raw bytes are discarded from memory immediately after encoding.

**Trusted Device Recovery.** If you have another device still logged in, you can initiate a recovery request. The recovering client generates an ephemeral ECDH keypair; the trusted device does the same. They derive a shared secret, and the trusted device encrypts your private key with that shared secret and sends it over. The ECDH key pairs exist for the duration of this exchange, typically seconds, and are then discarded. No long-lived key material, no server involvement in the actual key transfer.

**Recovery Circle (Social Recovery).** You can designate trusted contacts who each receive a share of your private key using Shamir's Secret Sharing, a cryptographic scheme that requires K-of-N shares to reconstruct the secret. No single contact has enough information to recover your key on their own, and none of your contacts know who the others are. When you need recovery, your contacts approve the request, each encrypting their share with an ephemeral ECDH shared secret, and once enough shares arrive, your client reconstructs the private key locally.

If none of these work? You can reset your account. Your servers, friends, and settings are preserved, but all encrypted message history is permanently lost. We're upfront about this: that's the tradeoff of real E2EE. We can't recover what we never had access to, and we won't pretend otherwise.

### What We Won't Do

We will not implement server-side message scanning. We will not build backdoors, "ghost protocols," or "exceptional access" mechanisms. We will not comply with legal demands that require breaking encryption, we'll challenge them in court instead (and if we lose, we'll be transparent about it).

We're aware this limits us in certain jurisdictions. Some countries may require capabilities we refuse to build. In those cases, our self-hosted option remains available, you can run your own Concord Voice server, on your own hardware, under your own control, with no connection to our network or our policies. Private, secure communication is a right, not a feature we can revoke.

**The worst case? If regulation makes it impossible for us to operate the hosted platform without compromising encryption, we'll open-source the codebase entirely and let the community take it from there. The technology should outlive the business, because Privacy is a Human Right, Period (Mic-Drop).**
