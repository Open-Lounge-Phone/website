---
title: "Versions and releases"
description: "How the server, firmware and hardware are versioned, which versions work together, where the changelogs are, and which version these docs describe."
sidebar:
  order: 6
---

Open Lounge Phone has three things that ship separately: the **server and apps**, the
**firmware** on the phone, and the **hardware**. Each has its own version numbers and its own
releases in the [repository](https://github.com/Open-Lounge-Phone/open-lounge-phone), and they
are built so that different versions keep working together.

## At a glance

| Part | Version | Released as | What changed |
|---|---|---|---|
| Server, companion app, browser phone, CLI | 0.6.0 (`server-v0.6.0`) | git tags `server-vX.Y.Z` | [Changelog: server and apps](/project/changelog/) |
| Phone firmware | 0.9.4 | `fw-vX.Y.Z` releases (none published yet: build from source) | [Changelog: firmware](/project/firmware-changelog/) |
| Labs firmware | 0.0.0 | built from source only (`firmware/labs/`) | [Labs firmware](/extend/labs/) |
| Hardware | v0.1 (board rev A) | the [`hw-v0.1`](https://github.com/Open-Lounge-Phone/open-lounge-phone/releases/tag/hw-v0.1) release, with Gerbers, parts lists and a build guide | its release notes |
| Device protocol | 1 | part of the server | [Wire protocol](/reference/protocol/) |
| Federation protocol | 1 (`/fed/v1`) | part of the server | [Federation spec](/reference/federation-spec/) |

## Server and apps

The server, the companion app and the browser phone are one codebase and one version: `version`
in the repository's `package.json`. A server shows it in `/api/health` and in its public
discovery document (`/.well-known/openloungephone`). A release is a git tag `server-vX.Y.Z`.

Updating a server is a redeploy: database changes apply by themselves, in order, and only ever
add to what's there. The public hub runs a recent build of `main`; its `/api/health` says which
version.

## Firmware

The phone's firmware has its own version (shown under **MENU → 0 About**). Two lines are built
from the same sources:

- **The phone (0.9.x).** Everything a phone does: setup, pairing, calls, voicemail, Lounge phones,
  extensions, updates. This is what a phone runs.
- **Labs (0.0.0).** The phone plus experiments: intercom, doorbell, check-in, Home Assistant,
  stories, macro pad, games. Built from `firmware/labs/`, never shipped as an update.

Official firmware releases will be tagged `fw-vX.Y.Z` and carry a signed image. A phone only
takes official updates if it was flashed with an official release build; a phone built from
source has updates off until you set up your own key and channel. No `fw-v*` release has been
published yet.

## Hardware

Hardware releases are tagged `hw-vX.Y` and hold the exact files the boards were made from.
**v0.1** is an early dev board prototype: four phones are built and working on the experimental labs build
(0.0.0), lightly tested so far. Expect a revision; we recommend waiting for board v1.0 before building.
**Board v0.9** is coming soon for tinkerers, fully assembled or as a bare PCB; there's no price or date yet
([interest list](https://github.com/Open-Lounge-Phone/open-lounge-phone/discussions/1)).

## Which versions work together

- **Phones and servers** speak the device protocol, now version 1. Adding things (an optional
  field, a new message, a new feature) keeps the version; anything else is a new version, and a
  server keeps accepting the previous one for at least 12 months. A phone that is too old for
  its server shows `UPDATE NEEDED`; one that is newer than its server shows `SERVER TOO OLD`.
- **Servers with each other** speak federation version 1. Each server lists the versions and
  optional features it supports and uses the best both sides share. If one side lacks a
  feature (rooms, say), you're told in plain words instead of something failing quietly.
- **Frozen examples** of every v1 message and signature are kept in the repository's tests and
  must keep passing, and every change is tested against the previous server release in both
  directions.

The exact rules: "Versions and compatibility" in the [wire protocol](/reference/protocol/) and
§9 of the [federation spec](/reference/federation-spec/).

## Which version these docs describe

This site is built from the repository's `main` branch: the reference pages, the hardware pages
and both changelogs are generated from it, so they describe the current development version.
Each generated page names its source file. Where something isn't built yet, or only works in
the browser phone so far, the page says so.
