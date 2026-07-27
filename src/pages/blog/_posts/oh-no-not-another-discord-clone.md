---
title: "Oh No, Not Another Discord Clone!"
description: "Yes, But Also, Emphatically No, and the Difference Is the Whole Point"
pubDate: 2026-07-07
category: "Product"
tags: ["product"]
readingTime: 21
slug: "oh-no-not-another-discord-clone"
---

Yes, But Also, Emphatically No, and the Difference Is the Whole Point

## TL;DR

Yes, it looks like Discord. No, it isn't another Discord clone. We kept the part of Discord that's genuinely good (the way it feels to hang out in a server with your people; a true virtual third space), and we threw out the part where a company reads the room and sells what it learns. Concord Voice is end-to-end encrypted everywhere, not as a toggle you have to find, but as a structural fact of the app. It's source-available. You can self-host the whole thing. Nobody makes money off your conversations, because nobody, including us, can read them. Everything below is me showing my work on why "it looks like Discord" and "it is Discord" are two very different sentences.

## Wall of Text Me (WOTM)

Let's just get the accusation out of the way, because I've heard it a dozen times and I'll hear it a dozen more: "Oh great, another Discord clone."

I get it. It's got servers. It's got channels. It's got voice rooms you drop into and text channels you scroll through, and a members list on the right. If you squint, it's Discord. If you don't squint, it's also kinda Discord. I'm not going to insult you by pretending we reinvented the wheel here. Discord figured out a genuinely great way for communities to gather, and pretending otherwise would be silly. Insert spiel on how good artists copy, and all that.

But "does it look like Discord" is the wrong question. The right question, the one this whole post is about, is "who owns the conversation you're having?" Because that's where every one of these apps answers very differently, and it's the answer that actually matters once you stop looking at the members list and start thinking about what happens to the words you type into it.

So here's how I'm going to judge everybody in this post, us included. Four axes:

- Is it actually end-to-end encrypted, and where? Not "encrypted" (everyone says that; it usually just means TLS to their server, where they can read it). We mean End-to-end, and which parts (text, group voice, video? Or one nice-sounding surface while the rest is in the clear?)
- Who profits from your data? Ads? Metadata harvesting? An AI model getting fed? A per-seat invoice? Or nobody?
- Can you see the code and run it yourself? Open, source-available, or closed-source. Is it actually self-hostable, or a black box you rent?
- Is voice a first-class citizen? Some of these were built voice-first. Some bolted a phone icon onto a chat app and called it a day. You can tell.

Grab a drink. This is a long one (it's called Wall of Text Me for a reason).

## The Incumbent Titan: Discord

Credit where it's due, and I want to be really clear about this because it sets up everything else: Discord is good at the thing Discord is for. The UX is excellent. The social model (persistent servers, roles, voice rooms you can just fall into) is the reason a whole generation stopped using anything else. We're not here to tell you Discord is bad software. It isn't.

And, genuinely, they did something impressive recently. As of March 2026, every voice and video call on Discord is end-to-end encrypted by default, no opt-in, via their DAVE protocol, which is open and has been independently audited by Trail of Bits. That's real work. That's the good version of a company taking encryption seriously, and I'll defend them on it.

Here's my problem, though, and it's a big one: your text isn't encrypted, and Discord has said it has no plans to change that. Every message you've ever typed into a Discord server sits on Discord's servers in a form Discord can read. The voice calls are private now; the giant searchable archive of everything your community has ever said is not. And Discord is an ad-and-Nitro business, and increasingly an ad business; those rewarded "Quests" ads have been rolling out since 2024, and so the content and the metadata are, ultimately, the asset.

Compared to us, that's not a clone-vs-original distinction; that's a soul distinction. We look like Discord, and we encrypt the text channels too, structurally, so that we, the company, physically cannot read them. Same clothes. Opposite priorities. (And if you want the extended version of why heavy-handed platform policy pushed a lot of people to start looking for exits in early 2026, hold that thought ; it comes back at the end, and it ties directly to my last Dev Series post.)

## The Other "Discord But ___" Crowd: Stoat (formerly Revolt), Guilded, TeamSpeak

These are the projects people usually mean when they say "just use a Discord alternative."

Stoat, recently rebranded from Revolt, is the one I'm most sympathetic to. It's open-source, AGPL-3.0, self-hostable via Docker, north of 600,000 users, and clearly built by people who care. Honestly, this value is aligned with us. The catch is the same catch we're open about on our own unfinished pieces: end-to-end encryption is still on their roadmap, not shipped. So today it's open and self-hostable, but not yet private-by-crypto. No shade here, just a status check, and I respect that they haven't slapped an "E2EE" sticker on something that isn't done. (I have opinions about companies that do. See... well most of this post.)

Guilded I'll keep short, because there's nothing left to keep long. Roblox bought it, and then Roblox shut it down on December 19th, 2025, folding it into "Roblox Communities." It is a former competitor. Pour one out (oof).

TeamSpeak is the granddad of "host your own voice server," and I have real affection for it (and PTSD from a-many of ARMA lobbies). When you self-host TeamSpeak, they collect zero data from your server; that's their whole model, and it's a genuinely privacy-respecting one. Voice traffic is encrypted, the server's yours, nobody's mining it. If you just want a low-latency voice box you fully own, it still slaps. Where it isn't us: it's voice-first to the point of being voice-only in spirit, the UX is from another era, it's proprietary, and TeamSpeak 6 has been sitting in beta with the self-hosted server still not feature-complete (a lot of people are still on TS3 for stability). It's a great voice server. It is not an encrypted-everything community platform, and it isn't trying to be.

## The Open, Federated Idealists: Element (Matrix) and Rocket.Chat

This is the section where I have to be careful, because these folks are on the right side of the argument, and I'm not going to pretend otherwise for a cheap point.

Element, on the Matrix protocol, is the closest thing to a philosophical sibling we have. End-to-end encrypted, federated (independent servers that talk to each other), self-hostable, open standard. It is so trusted that more than 25 governments run on it (parts of the US Department of Defence (or War, I guess), Germany's Bundeswehr, France's Tchap, a Belgian government rollout in 2026). That's not a toy. That's sovereign-grade communications. If you want maximum decentralisation and you're willing to run infrastructure, Matrix is a fantastic answer, and I'll say so to anyone.

Here's the fork in the road, and it's a difference of shape, not quality: Matrix is a protocol and a toolkit; Concord Voice is an opinionated product. Federation is powerful, and it's also complex; homeservers, bridges, the setup, the "which client, which server" question. We made a deliberately different bet: a polished, voice-first, opinionated app that a normal human can use in thirty seconds, with the encryption and self-hosting underneath, and without asking them to become a sysadmin first. Different tools for different people. (Telling detail from the front lines of this argument: when Discord announced its age-verification changes in early 2026, a wave of users migrated to Matrix. People are actively looking for this exit. We're building a door with a nicer handle.)

Rocket.Chat is open-source, self-hostable, and aimed squarely at regulated and enterprise "mission-critical" comms. Good stuff, and again, values-adjacent. The distinction: their end-to-end encryption is opt-in, per conversation, off by default, and only covers DMs and private channels, while public channels can't be E2E encrypted at all. And to be fair to everyone here, including them, independent academic analyses in 2024 found real weaknesses in that E2EE implementation's confidentiality and integrity guarantees (several since patched). That's not me dunking, crypto is f**king hard (Michael and I spent tons of hours getting it right), which is exactly why we treat it as a structural invariant reviewed to death rather than a feature you flip on. When encryption is opt-in, most people never opt in, and "private" becomes a thing you have to know to go find. Ours isn't a setting. It's the floor.

## The Enterprise Suits: Slack, Teams, and Skype (RIP)

Different universe, mostly, but people ask, so:

Slack (owned by Salesforce) is not end-to-end encrypted at all. Not the messages, not the channels. Their fancy Enterprise Key Management still leaves Slack able to access content (it's key management, not end-to-end encryption, and those are very different words). It's per-seat, it's a business tool, and your data is very much in the loop for features and AI. Fine for a workplace. Not private, not a community platform, not us.

Microsoft Teams does have E2EE, but only for one-to-one calls, off by default; an admin has to enable it, and both people have to toggle it on. Group calls, meetings, chat, channels, files: not end-to-end encrypted. It's a Microsoft-data, Copilot-in-everything enterprise product. Also fine for what it is. Also not this.

Skype, my beloved, my nostalgia, my "for the memes" entry, is dead (shocker for those who still didn't know). Microsoft retired it on May 5th, 2025, after 22 years and shoved everyone toward Teams. I include it purely so I can say: the OG "call your friends over the internet" app didn't lose to a competitor, it lost to a corporate reorg. Rest easy, little phone icon.

## The Messengers: WhatsApp, Telegram, and Signal

Now the ones everyone reaches for when they say "but MY app is encrypted."

WhatsApp genuinely is end-to-end encrypted by default. All of the messages, calls, media, all on the Signal Protocol. Credit given, sincerely. But end-to-end encryption isn't the whole story, and WhatsApp is the textbook case. The content is sealed; the metadata isn't, and the metadata is Meta's actual product (it's like they wanted to be E[vil] Corp from Mr. Robot). Who you talk to, when, how often, your number, your device, your IP, all flowing into the broader Meta machine. Your identity is your phone number. It's closed-source, you can't self-host it, and the part that made me laugh and then stop laughing, a late-2025 flaw let researchers harvest identifiers for up to 3.5 billion WhatsApp accounts, and the Meta AI bot baked into the app isn't end-to-end encrypted at all. It's an encrypted envelope with a very legible address book. That's the game.

Telegram is the one everybody assumes is encrypted, and mostly isn't. Credit first, because it's earned: it's enormous (roughly a billion users), the public channels and bots are genuinely excellent, and if you want to run a 200,000-person community, it'll do it without blinking. But here's the sleight of hand, and it's a big one: only "Secret Chats" are end-to-end encrypted, they're one-to-one, and you have to go switch them on. Every normal chat, every group, every channel, the entire default experience, is not E2EE. Telegram holds the keys, can read your content and your metadata, and did it all on home-rolled crypto that security folks have side-eyed for years. And the branding didn't survive contact with reality: Telegram spent a decade marketing itself as the uncompromising privacy app, then, weeks after French police arrested founder Pavel Durov in 2024, quietly rewrote its privacy policy to hand IP addresses and phone numbers to law enforcement across a far wider range of cases than before. The "uncompromising" part, it turned out, was compromisable.

Signal is the gold standard, and I will fight you about it. Nonprofit (a real 501(c)(3), the Signal Foundation), end-to-end encrypted everything, open-source, no ads, no data business, the crypto everyone else licenses. If you want the single most private way to message one person, it's Signal, full stop. We admire it, even to the point that a lot of our thinking is downstream of the standard they set. Where we're a different animal: Signal is a messenger, not a community. No servers-you-gather-in, no roles, no drop-in voice rooms for forty people. And even after adding optional usernames in 2024 (which do let you hide your number from other users), you still register with a phone number, so your identity is tied to a SIM. We're not trying to out-Signal Signal at one-to-one messaging. We're trying to be what Signal would look like if it were a place instead of a conversation.

## The Stuff Already On Your Phone: SMS, RCS, iMessage

Because "why not just text" is a fair question.

SMS is a postcard. Plaintext, no encryption, your carrier can read every word, the protocol's from the '80s and has known holes you could drive a truck through. It's a fallback, not a plan.

RCS is the interesting one, because it's genuinely getting better, and I won't pretend it isn't. The GSMA standardized cross-platform end-to-end encryption for RCS in 2025 (on the MLS protocol), and as of May 2026, encrypted RCS between iPhone and Android started rolling out in beta. That's real progress and good for everybody. The catch is it's tied to your phone number and your carrier, it's fragmented (Google-Messages-grade encryption vs. whatever your carrier ships), it's still rolling out, and, same as SMS, there's no such thing as a community, a server, a role, or a self-hosted RCS. It's a better pipe between two phones. It is not a place.

iMessage is legitimately excellent crypto. It's end-to-end encrypted by default, and Apple's PQ3 made it the first mainstream messenger with post-quantum protection (which, side note, is the direction we're headed to; more on that in a second). The asterisks: your iCloud Backup isn't end-to-end encrypted unless you specifically turn on Advanced Data Protection, so by default there's often a readable copy sitting in the cloud; it's Apple-only (the green-bubble apartheid is a feature to them, not a bug); you can't self-host it; and again, it's a messenger, not a community you own.

## Okay, But Would You Hand My Data Over Too?

Yes. Obviously. So does everyone else on this list, and anybody who tells you otherwise is either lying or just hasn't been asked yet.

I'd rather you hear it from me than in a comment thread: every legitimate company complies with lawful legal process. A valid court order lands, we answer it; it's right there in our Privacy Policy. We'll fight the sketchy ones, we'll insist they be valid and narrow, and we keep as little as possible so there's less to argue about, but at the end of a binding order, everybody complies. That's not the differentiator. (Pretending otherwise is roughly how Durov ended up learning about French pretrial detention firsthand.)

The real differentiator is what there even is to hand over, and that's architecture, not a promise. Watch the spectrum. Telegram's default chats aren't encrypted, so an order can compel the actual conversation. Proton, the gold standard of private email (and no villain in this story) can't read your message bodies because they're encrypted, but it still holds metadata (an IP, a recovery email, a payment record), and it's had to turn exactly that over through Swiss legal channels more than once; everyone who assumed "encrypted" meant "untouchable" got a rude lesson. And then there's Signal, whose answer to a subpoena is famously almost nothing, a couple of timestamps, because they built themselves to hold almost nothing.

We're aiming for the Signal end of that spectrum. Our channels are end-to-end encrypted, so a request for content gets ciphertext we genuinely cannot read, the same as Proton can't read your email. And we hold as little metadata as we can get away with, because the only data you can be sure never leaks is the data the company never had. We're not above the law, and we won't pretend to be. We just worked very hard to make sure that when the law comes knocking, there's almost nothing worth handing over.

## So, Where Does Concord Voice Get It Right?

Here's the honest synthesis, because after over a dozen competitors, you deserve the actual thesis and not just a victory lap.

Look back at that list. Almost everyone is strong on one axis. Signal nails privacy, but it isn't a community. Discord nails community and voice, but leaves your text readable. Matrix nails decentralization but asks you to run infrastructure. WhatsApp encrypts the content and harvests the context. iMessage is beautiful crypto in a walled garden. The good ones are each good at a corner of the problem.

Concord Voice is the bet that you shouldn't have to choose the corner. Concretely:

- End-to-end encrypted everywhere, as a structural invariant, not a toggle. Text channels and per-frame encrypted group voice and video (AES-256-GCM, RSA-4096 key wrapping). There is no "turn on encryption" setting because there's no way to turn it off ; it's built into how the app works, which means we, the company, physically cannot read your messages. Very few products on this entire list support encrypted text, encrypted group voice, and the community model. That intersection is the whole reason we exist.
- Nobody profits from your data, because nobody can see it. No ads. No telemetry. We actually ripped Sentry back out (that's its own Dev Series story). No data business. Subscriptions and a self-host option, and that's the entire model. E2EE-everywhere isn't just a privacy feature; it's a business-model commitment we can't quietly walk back later.
- Source-available today, and it outlives us. Concord is source-available under our CVSL 1.0 license, which converts to AGPL-3.0 automatically in 2030. If the company gets hit by a bus, the project doesn't die with it. We drop it open source like the Martyrdom deathstreak in MW2 (have I shown my age yet with some of these memes?)
- You can self-host it, and self-hosting is segregated on purpose. Run your own server, keep local accounts, and if you do, that instance doesn't sync to our network or show up in any public directory. That's deliberate: it's how families, gaming groups, and folks who want full control get private, secure comms entirely outside our walls. (Status check, because I don't do vaporware: the self-hosted installer is real and usable today; the comprehensive air-gapped/admin-panel version is in active development, not done.)
- Voice is first-class, not bolted on. We're in the Discord/TeamSpeak lineage, not the Slack/Teams "we added a call button" lineage. We have a real SFU media stack, per-frame E2EE, and tier-aware quality. Voice was the point from day one. It's literally in the name.
- And one more, since it ties two of these Dev Series posts together: yes, we age-gate too; a 16+ floor and, where the law demands it, age verification. We didn't have a choice about whether. We had a choice about how, and we built it to be identity-blind: the record is signed on your device, and the server literally never receives your birthday, your age, or your location. If you want the deep dive, it's the last post in this series ("Proving You're Old Enough Without Proving Who You Are"). The relevant bit here: the exact thing that drove a wave of people off Discord in early 2026 (heavy-handed age verification) is a thing we sat down and engineered to do without the surveillance. That's not a coincidence. That's the entire design philosophy showing up twice.

## Where We're Going

- We're in Beta now, marching toward a v1.0 general-availability release in (hopefully) January 2027.
- Post-quantum is on the map. A post-quantum hybrid handshake is a candidate for our next milestone. Apple did PQ3; we're not going to be the app still on yesterday's math when the quantum bill comes due.
- Mobile and the full self-hosted bundle (air-gapped install, admin panel, the works) are further out; real roadmap items, not shipped, and I'll flag them as done when they're done and not a second sooner. Their current target is v1.0.


## The Verdict on "Just Another Discord Clone"

In my humble opinion: No.

We wear the same clothes as Discord because the clothes work, and reinventing them would be vanity. We may have tweaked the UI and gone with a flavor of our own, of course, but the core components are there, and we aren't going to ignore them like they aren't. However, underneath, we're the opposite app: encrypted everywhere instead of readable-by-default, funded by subscriptions instead of by you, source-available and self-hostable instead of a black box you rent, built by two people who'd rather ship something honest than something that spies.

If that's the thing you want, backing the next place you and your people hang out, back us, or just follow along.

***Sincerely,***

***Mark, Co-Founder***

***Wrote a competitive analysis and somehow made it a personality***

## Legal Jargon, Disclaimers, and footnotes so we don't get litigated:
A few notes, because this post names names. All product and company names, logos, and trademarks are the property of their respective owners; references here are for identification and comparison only and do not imply any affiliation, sponsorship, or endorsement. Comparisons reflect publicly available information believed accurate as of July 2026 ; this is a fast-moving space and details change, so treat specifics as a snapshot, not gospel. Statements characterizing competitors' design choices, business models, or track records are our honest opinion based on the sources cited below. Anything about our own roadmap (release dates, post-quantum work, future self-hosting) is a forward-looking statement of current intent, not a guarantee; we ship things when they're done, and we'll say so when they are. Nothing here is legal or security advice.

## Sources:

Discord "every voice and video call… E2EE by default… DAVE… audited by Trail of Bits"

Discord, "Every Voice and Video Call on Discord Is Now End-to-End Encrypted" (2026), discord.com/blog; DAVE Protocol whitepaper, daveprotocol.com; audit by Trail of Bits.
Discord "your text isn't encrypted… no plans to change that"

DAVE scope is voice/video only (source above); "no plans" for text E2EE per Discord statements reported by BleepingComputer (2026).
Discord "rewarded 'Quests' ads… rolling out since 2024"

Discord Ads ; Quests, discord.com/ads/quests; Variety, "Discord Launches 'Arena Quests' Ad Product" (2025).
Revolt "rebranded to Stoat… AGPL-3.0… self-hostable… 600,000 users"

Stoat (software), Wikipedia; rebrand per AlternativeTo (Oct 2025); 600k+ figure per Stoat's own about page.
Revolt/Stoat "E2EE still on their roadmap, not shipped"

Stoat documentation/roadmap (E2EE listed as forthcoming).
"Roblox shut it down on December 19th, 2025"

Guilded, "Guilded will shut down on Dec 19, 2025", guilded.gg/blog; AlternativeTo (Nov 2025).
TeamSpeak "self-host… collect zero data… voice traffic encrypted… TS6 in beta"

TeamSpeak Support, self-hosting & security docs (support.teamspeak.com); TeamSpeak 6 Server beta (github.com/teamspeak).
Element/Matrix "E2E encrypted, federated, self-hostable"

Matrix.org spec; Element (element.io); Matrix (protocol), Wikipedia.
"more than 25 governments run on it… DoD, Bundeswehr, Tchap, Belgium"

Per Element's own figures, element.io/blog ("governments turn to Element and Matrix"); The Register (Feb 2026).
"when Discord announced its age-verification changes… a wave of users migrated to Matrix"

The Register, "Matrix messaging gaining ground in government IT" (Feb 2026), noting Discord-driven migration.
Rocket.Chat "E2EE is opt-in, per conversation, off by default… DMs and private channels"

Rocket.Chat, End-to-End Encryption Specifications, docs.rocket.chat.
Rocket.Chat "independent academic analyses in 2024 found real weaknesses… (several since patched)"

Kimura, Ito, Minematsu & Isobe, "Gravity of the Situation: Security Analysis on Rocket.Chat E2EE," IACR ePrint 2025/2300 / ACSAC ; responsibly disclosed (vendor contacted 30 May 2024; patches released).
"Slack (owned by Salesforce) is not end-to-end encrypted… Enterprise Key Management still leaves Slack able to access content"

Salesforce acquisition of Slack (2021, public filings); Slack Enterprise Key Management docs (slack.com) ; customer-managed keys, not E2EE.
"Teams… E2EE… only for one-to-one calls, off by default"

Microsoft Learn, End-to-end encryption for Microsoft Teams / Use E2EE for Teams calls (learn.microsoft.com).
"Skype… is dead. Microsoft retired it on May 5th, 2025"

Microsoft Support, "Skype is retiring in May 2025"; TechCrunch (28 Feb 2025).
WhatsApp "end-to-end encrypted by default… on the Signal Protocol"

WhatsApp Help Center / Meta Security whitepaper (faq.whatsapp.com).
WhatsApp "the metadata isn't… flowing into the broader Meta machine"

WhatsApp Privacy Policy / "Does WhatsApp collect or sell your data?" (faq.whatsapp.com).
"a late-2025 flaw let researchers harvest identifiers for up to 3.5 billion WhatsApp accounts"

Researchers at the University of Vienna reported a contact-discovery enumeration flaw (~3.5B identifiers), responsibly disclosed to Meta; reported by Cybernews (2025).
"the Meta AI bot… isn't end-to-end encrypted at all"

Meta/WhatsApp documentation on Meta AI (interactions with the AI assistant are not E2EE).
Telegram "only 'Secret Chats' are end-to-end encrypted… one-to-one… default… not E2EE"

Telegram FAQ / Privacy Policy (telegram.org) ; Secret Chats are E2EE and device-specific; Cloud Chats are not.
"French police arrested founder Pavel Durov in 2024"

Reuters / AP coverage of Durov's arrest and indictment in France (Aug 2024).
"quietly rewrote its privacy policy to hand IP addresses and phone numbers to law enforcement across a far wider range of cases"

Telegram Privacy Policy update (Sept 2024); Help Net Security / The Hacker News (Sept 2024).
Signal "Nonprofit (a real 501(c)(3), the Signal Foundation)… end-to-end encrypted everything"

Signal Foundation (signalfoundation.org); IRS 501(c)(3) status.
Signal "optional usernames in 2024… you still register with a phone number"

Signal, "Keep your phone number private with Signal usernames" (signal.org/blog, Mar 2024).
Signal "answers subpoenas with almost nothing ; a couple of timestamps"

Signal, published legal responses ("Big Brother"), signal.org/bigbrother ; returns account-creation and last-connection timestamps only.
SMS "plaintext, no encryption, your carrier can read every word"

General ; SMS/SS7 carry no E2EE; e.g., EFF, Surveillance Self-Defense.
"GSMA standardized cross-platform E2EE for RCS in 2025 (on the MLS protocol)"

GSMA Newsroom, "RCS Encryption: A Leap Towards Secure and Interoperable Messaging" (Mar 2025); RCS Universal Profile 3.0.
"as of May 2026, encrypted RCS between iPhone and Android started rolling out in beta"

Apple Newsroom, "End-to-end encrypted RCS messaging begins rolling out today in beta" (May 2026).
iMessage "end-to-end encrypted by default… PQ3… post-quantum"

Apple Security, "iMessage with PQ3" (security.apple.com, 2024).
iMessage "iCloud Backup isn't end-to-end encrypted unless you turn on Advanced Data Protection"

Apple Support, Advanced Data Protection for iCloud (support.apple.com).
Proton "can't read your message bodies… still holds metadata… handed… over through Swiss legal channels more than once"

Proton, Transparency Report & Information for Law Enforcement (proton.me/legal/transparency, proton.me/legal/law-enforcement) ; E2EE content, metadata handed over under binding Swiss orders.
