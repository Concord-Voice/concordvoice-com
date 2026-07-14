---
title: "Proving You’re Old Enough Without Proving Who You Are"
description: "When it comes to dealing with today’s evolving landscape and the erosion of privacy online at the hands of both governments and corporations, it’s..."
pubDate: 2026-07-06
category: "Privacy"
tags: ["privacy"]
readingTime: 15
slug: "proving-youre-old-enough-without-proving-who-you-are"
---

When it comes to dealing with today’s evolving landscape and the erosion of privacy online at the hands of both governments and corporations, it’s important to understand how these systems actually function in order to better protect ourselves when we walk through cyberspace.

There are two major components when it comes to Age Verification and why it is rapidly becoming prevalent in our daily lives.

## Problem 1: Government Ambiguity

The first layer is how our governments are typically implementing legislation. Age verification stems from a desire to protect children online from sensitive or harmful materials, a legitimate goal and value. However, the actual outcomes of these values are often extremely vague and ambiguous, doing little to protect kids while harming adults (all the while ignoring the blatant mishandling of one of the worst child exploitation scandals in history we can’t seem do anything about). It often leaves the bag in the hands of businesses and organizations, putting them in a position they’re either really upset or really happy to be in, and that position is ‘industry needs to figure it out, but if they’re caught letting kids have access to [insert some broad and often unreasonable categorization of sensitive and harmful material here], they will be fined into the dirt.’ This leads most to be overzealous and leaves two options because of the risk:

- Pull yourself out of the market, don’t service that customer base, and lose that business, but hey, you won’t be fined! Example: Adult websites geo-block regions, such as states that have implemented verification laws.
- Go bold and require government ID verification and facial recognition to detect age for access control, but now have to implement controls to safeguard this verification process (or, like some companies, just don’t, I guess…)


## Problem 2: Businesses Have to Manage Risk

For ethical companies and small businesses, no one wants to handle sensitive data, but they also can’t afford to back out of a market. Enter a concept called Cyber Risk Management. Risk Management for businesses is exactly what it sounds like: “How can we reduce our exposure?” When you are asked to start consuming heaps of personally identifiable information (PII), the risk spikes nearly exponentially (tons of new laws and regulations come into play). How do you store it, and for how long? Can we absorb this risk, or do we need more controls (aka buy more defense solutions)? Does our cyber insurance cover this? This boils down to what the organization’s response should be:

- Mitigation: Putting some form of controls in place to reduce and manage the risk to acceptable levels. Mitigation rarely means fully subverted, often is just to minimize the problem to a level that the organization can brunt the cost of.
- Acceptance: “This is fine” if risk management were a meme. Organizations choose to say, ‘if something happens, we can handle it appropriately.’
- Transference: A common tactic to shift the burden of risk to another organization. Most commonly, insurance.

When it comes to privacy and data security for PII, the easiest button is transference. This is why we often see many companies using third-party identification and verification services to say, ‘We did our due diligence; if something happens, it’s their fault.’ Which is generally fine in legal court, but often it fails in the court of public opinion these days. Realistically, it is a sorta safe solution for preventing something called context sharing, but when the company you are transferring the risk to sucks, you get data loss or worse, they intentionally lose it for money (aka selling your data and analytics).

What I mean by ‘safe for context sharing’ is that the typical function of these third-party verifiers is simply to say ‘yes’ or ‘no’ to the requester. In a perfect world, this separation of context is actually supposed to be good for privacy: The verifier doesn’t know what you’re actually doing, and the requester doesn’t know any of your private data. There is simply a firm handshake and an implied trust when the verifier says, ‘yeah, they’re good.’ Sorta like hiring a bouncer to work at your bar, rather than just you being your own bouncer.

In practice, though, these verification firms retain your data and sell it to an AI company to train its model, or to an analytics company that then sells targeted ads back to you so you buy something from the AI company (who then uses your data to train its models; full circle, Dead Internet Theory).

## How Does Concord Voice Approach This Issue?

We occupy a unique position. End-to-End Encryption means we can’t monitor any of the content on the platform (and we don’t want to). And we aren’t a social media platform; we merely create a place where people can gather to build their own community. These communities themselves could be classified as social media, but the moderation and policies of each community are up to the Owners, Admins, and Moderators, since we here have no way to do it (we don’t want to either; it’s not our place to dictate speech).

We do believe, however, in the social welfare of children and how having an online presence can harbor a negative influence on minors. That’s why we instituted a policy on a minimum age of 16 to access the Concord Voice Network. In our opinion, this isn’t foolproof, and there isn’t a universally agreed-upon age for introducing the concept of an ‘online presence’ to teenagers/children. However, it’s an immediate safeguard to ensure the platform is intended for individuals who likely have the capacity to read, listen, and speak through it, as well as to comprehend what they could encounter on it.

It’s also our opinion that parents should have the ultimate say over their kids’ internet access, not us, another business, or the government.

The impact of that has its own consequences, leaving some without a space to occupy, especially a safe one. We didn’t want to limit families and friend groups. There are some tech-savvy kids out there, along with parents who love gaming together with their kids. That’s why our self-hosted option includes creating local accounts, and if those local accounts are enabled, the server isn’t allowed to sync with the Concord Voice Network or be listed in the Public Directory. This allows tech-savvy kids and parents who want moderation and control, but still allow for access to communications (especially secure, privacy-focused comms), to host and manage their own servers outside the bounds of our policies and controls, so it would be perfectly acceptable to have these hosted for private use that doesn’t link back to our network, keeping a layer of segregation.

So… How do we handle age verification when required? We’ve approached this in a few ways.

One thing up front, because we don’t do vaporware: some of what follows is live in the beta today and some is still on the bench. I’ve flagged the status on each piece as we go. What’s live right now: the 16+ floor, the identity-blind signed record, the local date-of-birth check for NSFW, and the auto-disable if you come back underage. The rest is designed and coming.

### At Account Creation

Account creation leverages the honor system, in which you simply certify that you are at least 16 years old, or a legal adult when required by your jurisdiction’s laws. This isn’t foolproof or legally sound in some jurisdictions. Because of that, a growing number of U.S. states are pushing platforms to make reasonable attempts to check age, currently states like:

- LA, TX, UT, AR, MS, MT, NC, VA, FL

More annoyingly, this list keeps growing — it’s north of two dozen states as of mid-2026, and climbing fast since the Supreme Court upheld these laws in 2025, so treat it as a snapshot, not gospel. And to be clear, this isn’t legal advice; the specifics shift constantly. There are actually two different flavors of law in play here: adult-content laws that target sites that are mostly pornographic (which we are not) and app-store accountability laws that ask every app to grab an age range. The second is the one that actually reaches something like us, and it’s why the Google/Apple APIs further down exist.

To account for this, we will eventually begin asking users to certify that they aren’t in these 'higher obligation' jurisdictions. If they do not check (please help us follow the law), an additional layer is triggered by our legal requirements, and we will ask you to attest to your age using your date of birth at that time. This is something you are also later required to do to be able to toggle NSFW Content Access, but you won’t be prohibited from making an account unless you are below the age of 16 (and it isn’t illegal for you to be here).

So to be clear, the local date-of-birth check is live today; it currently lives in Settings ▸ Account, tied to NSFW access. The state-detection trigger and the jurisdiction inference below are designed and coming in later. Right now you can create an account without them.

When the jurisdiction step lands, entering your DoB will let your client use the following metadata locally (if it’s given permission/access) to work out which obligation level applies. None of it is sent to us or stored:

- IP Geolocation Inference
- Time Zone Inference
- User-Provided Data (DoB, Affirmation of being in a higher-obligation jurisdiction)

For the technically inclined, this is what the server actually stores. It’s identity-blind by construction; the privacy guarantee is the schema, not a policy we ask you to trust.


With it, the client processes it and creates an Age & Jurisdiction Verification Record, which is signed with your RSA key and stored on the server alongside your user profile. The privacy trick is that the record is identity-blind by design. That stuff never leaves your client or machine, only the yes/no result does. To put it bluntly, here’s the entire list of things this record will never contain:

- Your date of birth
- Your age
- Your IP address
- Your location
- Your timezone

That’s not a promise we’re asking you to take on faith, it’s the schema. A server that never receives your birthday can’t leak it.

Specifically, the jurisdictions, like states, above fall under jurisdiction_obligation 1, which requires a level of attestation before allowing users to go online. Once it’s done, you shouldn’t need to do it again under normal use.

Users who do not go through this additional flow now (likely because your jurisdiction does not require it) will encounter it later when completing the NSFW Content Access Attestation, if they want access to that content.

### Google and Apple SSO

Status: designed, not in the current beta yet, but here’s how it’ll work when it lands.

When you use Single Sign-On (SSO) with Google or Apple, we can call these APIs to perform an inferred age check. Google and Apple announced these APIs in 2025 and are switching them on jurisdiction-by-jurisdiction through 2026, letting developers perform age checks for apps in the app store without rolling their own solution (likely because they’ll begin requiring Age Verification in the app store, and unfortunately, we can’t help with that). This is acceptable for us because all we need is to pull the age range they hand back; a bracket like “18+”, not your exact age or birthday (whatever they already know about you; we aren’t asking for anything new). Using this method gives us something called Age Assurance (or technically, “age assurance” is the umbrella term for all of this, and what we’re specifically doing is its lightest-touch flavor, age inference), which is basically ‘diet’ Age Verification, where we’re assured by a trusted third party about a piece of data.  Note that not all Apple and Google accounts will have a valid age range, so this won’t work for everyone.

Your client will perform the SSO request locally. You’ll log in, authenticate, and validate the information you want to share with your client (it’ll say us, aka Concord Voice, but it will never actually send your SSO account details to the server, just what is needed for the SSO sequence). That information is loaded into memory, and the client checks the age range passed to it by the API. It then ticks two values in a settings store. First, valid_age (Yes/No), then nsfw_auth (Yes/No). The client then signs this verification using your RSA key for nonrepudiation and attaches it, along with metadata that is hashed to validate integrity in the event of future changes. We then toss the raw age data out of the airlock (aka out of memory and never storing to disk) and pass the signed verification to the server, along with storing your SSO method for future use (once SSO is established, we won’t ever automatically call the Age API again; it has to be done by you manually). The account is then reviewed by a quick server check with this new data, and it may be restricted based on the ticks it received.

If you believe you got the wrong age, please reach out to Apple or Google to resolve it on their end before attempting to resync SSO. You can force a resync to manually call the Age API after correcting any issues, once every 24 hours. Your age is tied to whichever SSO account you most recently synced, so if you use both Google and Apple, the newest sync wins and updates the record (as new data always overwrites the old).

### NSFW Content Access Attestation

In addition to the account creation honor system, users who specifically seek out to enable NSFW under Content Security must go through an NSFW Content Access Attestation. This is essentially a localized age gate that requires users to enter their birthday. This birthday is only kept locally, then calculated using the same two ticks we had above in the SSO section: valid_age Yes/No, nsfw_auth Yes/No. The client then goes through the same signing process with their key and verifies that the user can toggle NSFW. NSFW tags are applied at the community level by server owners, admins, and moderators. Server owners without the nsfw_auth flag will have their servers prohibited from hosting NSFW chats. NSFW flags are required when the content features things we strictly define in our Terms of Use.

Status: the personal DoB gate and the nsfw_auth flag are live today. The server-level pieces like blocking un-attested owners from hosting NSFW, and the server-wide NSFW label below, are designed and coming.

### Stripe Payments

Status: designed, not in the current beta yet.

A final form we can use if it’s a last resort. When a user subscribes to one of our premium tiers and uses a credit line (explicitly only credit, since contract law generally prohibits someone under 18 from having a credit card), we can infer age assurance as well. The client can fetch very basic metadata from Stripe, our payment processor. What it will do is validate the name, username, and that a credit line was used. Once that is applied, we can automatically fulfil age assurance to the user, unless there is an indication that the user is not the same person as the cardholder. (Worth being honest that this one’s a soft signal, not proof — a minor can be an authorized user on a parent’s card — which is exactly why it’s the last resort.)

## What Happens if Age Falls Below Thresholds?

Status: the conflict-resolution and threshold logic below is part of the designed-and-coming set, since it depends on the SSO/Stripe flows above. The one piece that’s live today is the last one, the auto-disable.

First, an understanding of what happens if there are conflicting age reports:

- If a user entered an age via the NSFW Content Access Attestation, that is authoritative. If the user then uses SSO, SSO becomes the authoritative source of age and overwrites the user attestation, specifically because the SSO provides Age Assurance.
- If the user used SSO before the attestation, they will bypass attestation because their account has already been validated.

Now, for age threshold rules:

- If the Attestation marks a user’s record as nsfw_auth=true, the NSFW Content Access toggle will be enabled and can be toggled on. This means that they will be granted access to NSFW-labeled chats and content in servers. This label is required for specific types of chats, per our Terms of Use. Note that if a substantial share of channels on a server are marked as NSFW, the entire server will receive an NSFW label, preventing anyone who is not attested or assured from joining. This threshold is ~33%, aka the rough “one-third” test that a number of state adult-content laws use to decide what counts as a regulated adult site (Texas HB 1181, Utah SB 287, and friends). (You’ll sometimes hear this pinned on CDA Section 230, it isn’t; 230 is a separate law, the platform-liability shield that applies at the Federal Level.)
- If the age tick only marks 16+, but not 18+, the NSFW Content Access toggle will remain disabled and cannot be toggled on. To get access at 18, you simply re-run the check, a fresh attestation or an SSO resync (you can resync once per day), and once it comes back 18+, the account flags nsfw_auth and the toggle unlocks. (We don’t run a background countdown to your birthday, because we deliberately don’t store your birthday to count from, so the upgrade happens when you re-verify, not on a timer.)
- Finally, if both tick marks are no, their age is not valid (below the threshold), and the account is automatically disabled from all features, but they can still log in to the client to continue and use other methods to validate their age.


## What Concord Voice Will Not Do

At this time, we have no intent to implement a full Age Verification integration, whether we develop it in-house or obtain it from a third party.

This does restrict us in certain parts of the world. However, we can still offer Self-Hosted Servers to anyone at any time for their own personal use. This is vital to ensuring free access to private and secure communications for anyone.

Down the road, do I see this position changing? Unfortunately and transparently, it is likely, but we are unwilling participants. The current track record of government support for online ID tracking and verification is growing, and it has become a major concern of ours as we continue to develop ways that are minimally invasive of privacy and work around storing PII and other data on our hosted servers, specifically.

It’s not our goal to regulate access to the platform or collect a whole bunch of data, especially PII. In this particular stage, what all of this is, is more of an enforcement/mandate, lest we just get completely screwed. Worst case, the business side of things will cease to exist, but the project doesn’t die with us: Concord Voice is source-available today, and under the CVSL 1.0 license it converts to AGPL-3.0 automatically, so the community can pick it up and run with it if it ever does go nuclear, of course.

The last thing we want is for this app to end up in the hands of malicious companies that use these verification laws to make more money…

***Sincerely,***

***Mark, Co-Founder***

***Studied cyber law during their bachelors and masters programs***

***... And hated it***
