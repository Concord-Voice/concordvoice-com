---
title: "Age Verification and Right to Privacy"
description: "How to keep minors safer without building the surveillance apparatus that age-verification mandates usually demand."
pubDate: 2026-05-12
category: "Privacy"
tags: ["privacy", "policy", "safety"]
readingTime: 13
slug: "age-verification-and-right-to-privacy"
---

When it comes to dealing with today’s evolving landscape and the erosion of privacy online at the hands of both governments and corporations, its important to understand how these systems actually function in order to better protect ourselves when we walk through cyberspace.

There are two major components when it comes to Age Verification and why it is rapidly becoming prevalent in our daily lives.

## Problem 1: Government Ambiguity

The first layer is how our governments are typically implementing legislation. Age verification stems from a desire to protect children online from sensitive or harmful materials, a legitimate goal and value. However, the actual outcomes of these values are often extremely vague and ambiguous, doing little to protect kids while harming adults (all the while ignoring the literal load-bearing CP beam we can’t do anything about, cause it’ll ‘collapse the whole system’). It often leaves the bag in the hands of businesses and organizations, putting them in a position they’re either really upset or really happy to be in, and that position is ‘industry needs to figure it out, but if they’re caught letting kids have access to [*insert some broad and often unreasonable categorization of sensitive and harmful material here*], they will be fined into the dirt.’ This leads most to be overzealous and leaves two options because of the risk:

Pull yourself out of the market, don’t service that customer base, and lose that business, but hey, you won’t be fined! Example: Adult websites geo-block regions, such as states that have implemented verification laws.

Go bold and require government ID verification and facial recognition to detect age for access control, but now have to implement controls to safeguard this verification process (or, like some companies, just don’t, I guess…)

## Problem 2: Businesses Have to Manage Risk

*Meanwhile, when trying to protect actual victims and bring justice… **(This is a parody, not a direct quote. Don’t sue us…)*

For ethical companies and small businesses, no one wants to handle sensitive data, but they also can’t afford to back out of a market. Enter a concept called Cyber Risk Management. Risk Management for businesses is exactly what it sounds like: “How can we reduce our exposure?” When you are asked to start consuming heaps of personally identifiable information (PII), the risk spikes nearly exponentially (tons of new laws and regulations come into play). How do you store it, and for how long? Can we absorb this risk, or do we need more controls (aka buy more defense solutions)? Does our cyber insurance cover this? This boils down to what the organization’s response should be:

**Mitigation**: Putting some form of controls in place to reduce and manage the risk to acceptable levels. Mitigation rarely means fully subverted, often is just to minimize the problem to a level that the organization can brunt the cost of.

**Acceptance**: “This is fine” if risk management were a meme. Organizations choose to say, ‘if something happens, we can handle it appropriately.’

**Transferance**: A common tactic to shift the burden of risk to another organization. Most commonly, insurance.

When it comes to privacy and data security for PII, the easiest button is transference. This is why we often see many companies using third-party identification and verification services to say, ‘We did our due diligence; if something happens, it’s their fault.’ Which is generally fine in legal court, but often it fails in the court of public opinion these days. Realistically, it is a sorta safe solution for preventing something called context sharing, but when the company you are transferring the risk to sucks, you get data loss or worse, they intentionally lose it for money (aka selling your data and analytics).

What I mean by ‘safe for context sharing’ is that the typical function of these third-party verifiers is simply to say ‘yes’ or ‘no’ to the requester. In a perfect world, this separation of context is actually supposed to be good for privacy: The verifier doesn’t know what you’re actually doing, and the requester doesn’t know any of your private data. There is simply a firm handshake and an implied trust when the verifier says, ‘yeah, they’re good.’ Sorta like hiring a bouncer to work at your bar, rather than just you being your own bouncer.

In practice, though, these verification firms retain your data and sell it to an AI company to train its model, or to an analytics company that then sells targeted ads back to you so you buy something from the AI company (who then uses your data to train its models; full circle, [Dead Internet Theory](https://en.wikipedia.org/wiki/Dead_Internet_theory)).

## How Does Concord Voice Approach This Issue?

First and foremost, because Citizens United hasn’t been overturned yet, and we, as a business, get to have a say in politics still: F*** current Age Verification laws.

Secondly, we occupy a unique position. End-to-End Encryption means we can’t monitor any of the content on the platform (*and we don’t want to*). Secondly, we aren’t a social media platform; we merely create a place where people can gather to build their own community. These communities themselves *could* be classified as social media, but the moderation and policies of each community are up to the Owners, Admins, and Moderators, since we here have no way to do it (*we don’t want to either; it’s not our place to dictate speech*).

We do believe, however, in the social welfare of children and how having an online presence can harbor a negative influence on minors. That’s why we instituted a policy on a minimum age of 16 to access the Concord Voice Network. In our opinion, this isn’t foolproof, and there isn’t a [universally agreed-upon age](https://www.aap.org/en/patient-care/media-and-children/center-of-excellence-on-social-media-and-youth-mental-health/qa-portal/qa-portal-library/qa-portal-library-questions/age-to-introduce-social-media/) for introducing the concept of an ‘online presence’ to teenagers/children. However, it's an immediate safeguard to ensure the platform is intended for individuals who likely have the capacity to read, listen, and speak through it, as well as to comprehend what they could encounter on it.

It's also our opinion that **parents** should have the ultimate say over their kids' internet access, not us, another business, or the government.

The impact of that has its own consequences, leaving some without a space to occupy, especially a safe one. We didn’t want to limit families and friend groups. There are some tech-savvy kids out there, along with parents who love gaming together with their kids. That’s why our self-hosted option includes creating local accounts, and if those local accounts are enabled, the server isn’t allowed to sync with the Concord Voice Network or be listed in the Public Directory. This allows tech-savvy kids and parents who want moderation and control, but still allow for access to communications (especially secure, privacy-focused comms), to host and manage their own servers outside the bounds of our policies and controls, so it would be perfectly acceptable to have these hosted for private use that doesn’t link back to our network, keeping a layer of segregation.

So… How do we handle age verification when required? We’ve approached this in a few ways.

### At Account Creation

Account creation leverages the honor system, in which you simply certify that you are at least 16 years old, or a legal adult when required by your jurisdiction’s laws. This isn’t foolproof or legally sound in some jurisdictions. In this case, we must, by law, make reasonable attempts to validate a user’s age at account creation in the following U.S. states:

> **LA, TX, UT, AR, MS, MT, NC, VA, FL**

To account for this, we ask users to certify that they aren’t in these states. If they do not check (please help us follow the law), an additional layer is triggered by our legal requirements, and we will ask you to attest to your age using your date of birth at that time. This is something you are also later required to do to be able to toggle NSFW Content Access, but you won’t be prohibited from making an account unless you are below the age of 16 (and it isn’t illegal for you to be here).

Once you enter your DoB, your client uses the following metadata (if it’s given permission/access):

- IP Geolocation Inference
- Time Zone Inference
- User-Provided Data (DoB, Affirmation of being in a higher-obligation jurisdiction)

<aside class="post-aside post-aside--right" aria-label="Age and Jurisdiction Verification Record schema">
<pre class="post-code" tabindex="0"><code># Age &amp; Jurisdiction Verification Record
# Schema version: v1
jurisdiction_obligation: int     # 0 Honor | 1 Attestation | 2 Assurance | 3 Verification
obligation_sources: [str]        # ordered, primary signal first
confidence: str                  # "high" | "medium" | "low"
assurance_signature: str|null    # HMAC[username, assured_date, provider, sub_hash]
assurance_provider: str|null     # "google" | "apple" | "stripe_credit"
assured_date: str|null           # ISO 8601 UTC
attestation_signature: str|null  # HMAC[username, attestation_date, machine_id]
attestation_date: str|null       # ISO 8601 UTC
client_signature: str            # RSA sig over canonical payload
client_version: str              # semver
valid_age: bool                  # Tracks if 16+
nsfw_auth: bool                  # Tracks if able to access NSFW
obligation_schema_version: str   # "v1"
last_change: str                 # ISO 8601 UTC
conflict_flag: bool              # Monitors if there is a conflict between sources
</code></pre>
</aside>

With it, the client processes it and creates an *Age & Jurisdiction Verification Record*, which is packaged up, encrypted, and stored on the server, along with your user profile, and signed with your RSA Key. This record simply contains data as shown in our example, with no actual PII associated with it (we don’t save DoB, IP addresses, time zones, geolocation inference, or age; *that stuff never leaves your client or machine*). Specifically, the states above fall under jurisdiction_obligation 1, which requires a level of attestation before allowing users to go online. Once it’s done, it is never required again.

Users who do not go through this additional flow now (likely because your jurisdiction does not require it) will encounter it later when completing the NSFW Access Control Attestation, if they want access to that content.

### Google and Apple SSO

When you use Single Sign-On (SSO) with Google or Apple, we can call these APIs to perform an inferred age check. Google and Apple rolled out these new APIs in early 2026, allowing developers to perform age checks for apps in the app store without requiring their own solution (likely because they will begin requiring Age Verification in the app store, and unfortunately, we can’t help with that). This is acceptable for us because all we need is to pull the inferred or verified age (whatever they know about you already, we aren’t asking for anything new). Using this method gives us something called Age Assurance, which is ‘diet' Age Verification, where we are assured by a trusted third party about a piece of data. Note that not all Apple and Google accounts will have a valid age value.

Your client will perform the SSO request locally. You’ll log in, authenticate, and validate the information you want to share with your client (it’ll say us, aka Concord Voice, but it will never actually send your SSO account details to the server, just what is needed for the SSO sequence). That information is loaded into memory, and the client checks the age value passed to it by the API. It then ticks two values in a settings store. First, valid_age (Yes/No), then nsfw_auth (Yes/No). The client then signs this verification using your private RSA encryption key for nonrepudiation and attaches it, along with metadata that is hashed to validate integrity in the event of future changes. We then dump the raw age data out of memory (never storing to disk) and pass the signed verification to the server, along with storing your SSO method for future use (once SSO is established, we won’t ever automatically call the Age API again; it has to be done by you manually). The account is then reviewed by a quick server check with this new data, and it may be restricted based on the ticks it received.

If you believe you got the wrong age, please reach out to Apple or Google to resolve it on their end before attempting to resync SSO. Once SSO is applied and age is ticked, the account can only have age updated via the SSO provider. You can force a resync to manually call the Age API after correcting any issues, once every 24 hours. However, the age data on your account is ‘married’ to the SSO account used, so switching to a new one won’t help. If you use both Google and Apple as SSO providers for the account, whichever SSO provider is used most recently wins (as new data will always update the record).

### NSFW Content Access Attestation

In addition to the account creation honor system, users who specifically seek out to enable NSFW under Content Security must go through an NSFW Content Access Attestation. This is essentially a localized age gate that requires users to enter their birthday. This birthday is only kept locally, then calculated using the same two ticks we had above in the SSO section: valid_age Yes/No, nsfw_auth Yes/No. The client then goes through the same signing process with their key and verifies that the user can toggle NSFW. NSFW tags are applied at the community level by server owners, admins, and moderators. Server owners without the nsfw_auth flag will have their servers prohibited from hosting NSFW chats. NSFW flags are required when the content features things we strictly define in our Terms of Use.

### Stripe Payments

A final form we can use if it’s a last resort. When a user subscribes to one of our premium tiers and uses a credit line (explicitly only credit, since contract law generally prohibits someone under 18 from having a credit card), we can infer age assurance as well. The client can fetch very basic metadata from Stripe, our payment processor. What it will do is validate the name, username, and that a credit line was used. Once that is applied, we can automatically fulfil age assurance to the user, unless there is an indication that the user is not the same person as the cardholder.

### What Happens if Age Falls Below Thresholds?

First, an understanding of what happens if there are conflicting age reports:

If a user entered an age via the NSFW Content Access Attestation, that is authoritative. If the user then uses SSO, SSO becomes the authoritative source of age and overwrites the user attestation, specifically because the SSO provides Age Assurance.

If the user used SSO before the attestation, they will bypass attestation because their account has already been validated.

Now, for age threshold rules:

If the Attestation marks a user’s record as nsfw_auth=true, the NSFW Content Access toggle will be enabled and can be toggled on. This means that they will be granted access to NSFW-labeled chats and content in servers. This label is required for specific types of chats, per our Terms of Use. Note that if a substantial share of channels on a server are marked as NSFW, the entire server will receive an NSFW label, preventing anyone who is not attested or assured from joining. This threshold is ~33%, the rough test that is applied in CDA Section 230.

If the age tick only marks 16+, but not 18+, the NSFW Content Access toggle will remain disabled and cannot be toggled on. There is a server-side timer set exactly 2 years from the attestation or assurance date. The user can also trigger a resync with SSO at any time (once per day) or use another method to verify their age. After the timer expires, or if SSO is manually resynced and the age changes, the account will automatically flag nsfw_auth and enable the NSFW Content Access toggle.

Finally, if both tick marks are no, their age is not valid (below the threshold), and the account is automatically disabled from all features, but they can still log in to the client to continue and use other methods to validate their age.

## What Concord Voice Will Not Do

At this time, we have no intent to implement a full Age Verification integration, whether we develop it in-house or obtain it from a third party.

This does restrict us in certain parts of the world. However, we can still offer Self-Hosted Servers to anyone at any time for their own personal use. This is vital to ensuring free access to private and secure communications for anyone.

Down the road, do I see this position changing? Unfortunately and transparently, it is likely, but we are unwilling participants. The current track record of government support for online ID tracking and verification is growing, and it has become a major concern of ours as we continue to develop ways that are minimally invasive of privacy and work around storing PII and other data on our hosted servers, specifically.

It's not our goal to regulate access to the platform or collect a whole bunch of data, especially PII. In this particular stage, what all of this is, is more of an enforcement/mandate, lest we just get completely screwed. Worst case, the business side of things will cease to exist, but we can release the source code openly to the world and let the community take control, if it ever does go nuclear, of course.

The last thing we want is for this app to end up in the hands of malicious companies that use these verification laws to make more money…


