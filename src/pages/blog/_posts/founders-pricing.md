---
title: "Founders Pricing, and What We Built While You Weren't Watching"
description: "A month of quiet, one second region, and the number we've been dodging. Founders Pricing is 50% off through 120 days past v1.0 GA, plus everything that shipped since the intro video, including the things we broke."
pubDate: 2026-09-21
category: "Company"
tags: ["company"]
readingTime: 12
slug: "founders-pricing"
---

*A month of quiet, one second region, and the number we've been dodging.*

Hey there! So, the intro video went up on August 21 and then we went quiet, which from the outside looks exactly like every other project that posts one slick launch video and is never heard from again. Fair read. A wrong one, but fair. Let's get into what's been going on.

So this is the first of these monthly posts, and from here on it runs alongside the dev-vlog. The vlog is what we say out loud, and this is where the stuff that doesn't survive being said out loud goes: numbers, dates, the specific shape of what broke (think of it like footnotes you don't read in those long academic papers).

First, we mentioned how we would eventually enable subscriptions for beta users at an alternative price point due to the platform being unfinished, and since some of you likely want to know what that actually looks like:

Founders Pricing is 50% off. It runs through 120 days after v1.0 reaches general availability, and not one day less. Why 120 days? Because we are running up against our timeline, and rather than delay GA so we can squeeze in some early access subs, we want to allow it to go onward and be more of an early benefit and reward for those who adopt us as a platform. Honestly, there's a real chance we don't get discount pricing shipped before v1.0 lands at all. Billing is genuine work and it sits behind the features we'd actually be billing you for, so putting the end 120 days past GA gives us room to be late without the whole thing turning into a technicality.

We're calling it Founders Pricing instead of "early access discount" because an early access discount is the kind of phrase that quietly disappears the day somebody decides it's inconvenient. A name with a date attached is harder to walk back, that's the whole point of giving it one.

But Mark, if it's such a good deal, why does it end at all?

Because it isn't a loyalty program, it's a bet you're making before we've earned it. Founders Pricing exists so nobody has to commit sight unseen: you get a real window, running past our own GA date, to use the finished v1.0 before full pricing shows up. Nearly half-a-year is deliberately generous (we argued about whether it was too generous, then did it anyway). It is also finite, and I'd rather tell you the end date now than let you find it in a billing email later.

What hasn't moved: the three things we said in the video. We don't open early access until most of what's on the pricing page is actually in the service (which is another reason why we pushed it out past 1.0; we don't want to delay features on building out the billing modal before we've even finished the things we'd be billing for, that's just stupid). Founders subscriptions don't cost v1.0 pricing. And if you subscribe and stay subscribed your price locks, through beta and past v1.0, with thirty days of grace if a card fails. Think of that last one less like a SaaS tier and more like a rate lock on a mortgage: the number you signed at follows you, and it sure as hell isn't something we will be changing on you.

I rewrote the pricing page three times in one weekend and landed almost exactly where Michael and I started. Some of that month was less productive than others.

The rest of it wasn't. Over three hundred pull requests landed between the video and this post, so rather than list them all, here is what actually changed about using the thing.

## Screen sharing got most of the month

This was the big one, and it took eight separate pull requests to get right.

- **The share picker is two tabs now, not one long pile.** It used to list every screen and every open window in two flat lists, which on a working machine means scrolling past a dozen browser windows to find the one you want. Screens and Windows are now separate grids of thumbnails. There was briefly a third tab, Applications, meant to group each app's windows under its name. It never reached a release and we deleted it, for two reasons worth knowing. An application is just its windows, so offering the same windows twice in two layouts asks you to pick between two views of one thing. And guessing which app a window belongs to goes wrong in genuinely funny ways: a Terminal window is titled with its dimensions, so every terminal that happened to be the same size got filed together under a heading that read "183x62". Not useful.
- **Screen sharing carries sound now, and tells you the truth about which sound.** Sharing a screen sends your computer's audio by default, with a switch to turn it off. The important part is the honesty: "your computer's sound" means *everything playing*, so on a two-monitor setup the people watching hear the other monitor too. We say that on the control rather than burying it in a tooltip, because the one thing it must never do is quietly send every other sound on your machine when you thought you were sharing one thing.
- **Sharing one window can send just that app's audio.** This is the piece that took the whole month. Until now, sharing a single window meant sharing it silently, because the only audio the app could capture was the entire system mix, which is the wrong answer for a window share. Nobody demonstrating one application wants the call to hear their email arrive. On a machine that supports it, a window share now carries that app's sound and nothing else. Where it isn't available the control is switched off and the reason sits right underneath it, in plain sight, reachable by keyboard and screen reader. Right now that works on macOS. Windows and Linux don't have it yet, and the app says so rather than letting you find out mid-call.
- **You can switch what you're sharing mid-call** without dropping the share and starting over.

## Voice and video

- **The in-call bar was reorganised** into clusters that group by what the control actually does, and the picker collapses instead of sprawling.
- **Camera quality now steps down repeatedly before anyone gets paused.** Previously a congested call went more or less straight to pausing someone's video. Now it walks the quality down in stages first, and pausing is the last resort rather than the second one.
- **Avatars show in the voice participant list**, which sounds trivial until you are in a call with eight people and every row is a name in the same font.
- **New calls get placed on the least-loaded media worker** rather than whichever one answered first.
- **We fixed a real one on the way out the door**: per-sender RTP priority was being dropped on the first encoding, which stopped camera video publishing entirely in some calls. That one shipped last week.

## Messages and chat

- **Message expiration is a real shared setting now.** You can configure how long messages last in a conversation, expired messages get swept on startup rather than whenever the app happens to notice, and changing the timer leaves a line in the conversation saying who changed it and to what. That last part replaced a dismissable notice that vanished once dismissed, which meant the answer to "when did this change?" lived in somebody's memory. Now it's in the history.
- **Expiration and purge are separate things again.** They had grown into one box at the top of the message list, which is exactly why the placement felt wrong to everyone who looked at it. One is ambient status, the other destroys data. They should not share a control.
- **Read markers work the way you expect.** The marker advances while you are actually reading, busy threads open at your first unread message instead of the bottom, and the unread badge clears when the messages are read rather than sometime later.
- **GIFs pause when Concord Voice isn't focused**, with a hover-only mode if you want them stiller than that. A background full of looping animation is a battery and attention tax nobody asked for.
- **Invites got a pass, and it lands in the next release rather than this one.** The invite button in a DM will list every server you can actually invite to (it used to show whichever server you last visited, and often nothing at all), servers you are already in are greyed out and read "already a member" instead of failing after the click, and when creating an invite does fail the reason appears above the message box rather than the button quietly doing nothing. That merged after we cut 0.2.47, so it isn't in your hands yet.

## Rich Presence

Activity sharing landed across the desktop app: member rows and profile cards show what someone is doing, your own panel shows who is actually eligible to receive it, and there are per-category privacy settings so "what I'm doing" and "who can see it" stay two separate decisions. Where a server withholds detail, the detail stays withheld rather than leaking out through some other surface.

## The infrastructure half

- **A control-plane deploy no longer recycles the media plane** - updating the API used to bounce the media container along with it, which meant restarting your call for reasons that had nothing to do with calls. That coupling is gone. A media-plane deploy still recreates the container, so this isn't zero-downtime in general. Blue-green is the next thing, not a done thing.
- **A watchdog that restarts what's actually broken** - it checks health first, rather than rebooting everything on a timer and hoping something good happens.
- **Readiness and liveness endpoints plus a proper stop grace period**, so a deploy waits for the thing to actually be ready instead of assuming it is.
- **Off-site encrypted backups with a pinned break-glass recipient.** Unglamorous. Also the only reason a bad night stays a bad night instead of becoming a bad quarter.

And a second region. We bought a US West box, and the multi-region build-out is phased and written down, with its exit criteria defined. We've started implementing it but it's a slow process as to not absolutely wreck our own shit (balancing async compute, managing geo-routing to get the lowest latency, finding rooms cross regions, intra-cloud private routing, etc etc).

We are not highly available yet. Multi-region failover is not live. We could have written "now with high availability" in this paragraph and I'd guess fewer than one reader in fifty would have checked, because nobody audits a damn blog post, but there's no sense in it yet. A second region you haven't finished wiring up is a spare tire in somebody else's trunk: it's genuinely progress, and it will not help you at all on the night you need it. We'll tell you when it's live. It isn't today. Eventually, you will have auto-routed voice and video calls for lowest latency and the option for manual regional overrides at your preference.

## What we broke, and what we caught

This is the part most companies leave out, and it's the part I'd actually want to read.

**We locked every installed client out of our own API.** The desktop app pinned the TLS certificate for our API, which is a reasonable-sounding security measure right up until Cloudflare rotates that certificate on its own schedule. Then every client that re-verified got a flat connection failure and simply could not reach us. Apps that had been running continuously still worked, and would have died the moment anyone restarted them. The detail that saved us is almost funny: the only recovery channel was shipping a release, and that worked solely because the update feed rides its own separate connection against a host we had not pinned. We had accidentally built exactly one door our own lock couldn't close. The pin is gone.

**We shipped a watchdog that had never once run.** We built the health actor, merged it, documented the install command, and only found out it had never reached a single server when an operator ran that documented command and got a refusal. The deploy manifest had never listed the directory, so nothing had ever been copied anywhere. It had been impossible on every host from the moment it merged. The reason we found it at all is that the install script fails closed: it refused and said so, instead of exiting quietly and letting us believe it worked. A tool that lies when it fails is worse than no tool.

**We audited our own documentation and found it wrong in 303 places.** 295 were drift, the ordinary rot of docs written before the code moved underneath them. The other eight were outright false claims. And one of those was mine: I had written a note saying user-submitted diagnostics were being written into a public repository, and flagged stripping them as an open question. That was wrong, and I wrote it without reading the pipeline I was describing. The stripping already happens, server-side, before anything is published, and the design had anticipated a public inbox from the start. I withdrew the claim publicly. I'd rather be on record having overstated a privacy risk and corrected it than have you find out later that I never checked.

## Two more things, further out

We're working on partnerships with privacy-focused organizations, the kind of groups whose entire reason for existing is an argument against how the rest of the internet is funded. Nothing is signed, so don't hold us to a name yet, but it has been something we have been eyeing since we started. And back during the Kickstarter, before we knew whether we'd have revenue at all, we committed a slice of it to Stripe Climate. That commitment stands. Neither is a live program today (Stripe Climate runs through Stripe payment processing directly, so it's already enabled, it's just idle until we start taking subscriptions).

Last, two things I'm going to be deliberately unhelpful about.

There are hints scattered around our website right now. Some in plain sight, some not. I'm not telling you where, and the blackboard in the video wasn't decoration either.

And there's something in the works I won't detail yet, except to say that if you ever dragged a friend into an MMO for a mount you still have equipped (I still love my Nightwing mount), you already know the shape of it. Bring people with you. Both of you should get something out of it. That's why we want to build a private place for you and your people.

See you soon in the vlog, and back here next month.

Sincerely, Mark, Co-Founder, Cryptology enthusiast because I watched The Imitation Game several times… On TikTok.
