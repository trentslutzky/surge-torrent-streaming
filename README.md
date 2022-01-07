<h1 align="center">
  <br>
  <img src="https://github.com/trentslutzky/surge-torrent-streaming/blob/main/repo/logo.png" alt="SURGE" width="450">
  <br>
</h1>

<h4 align="center">Graphical Frontent for finding torrents and streaming to MPV through Webtorrent</h4>

**Surge** is an electron app I created so that I could easily find torrent magnet links, then stream them to [MPV](https://mpv.io/) using [WebTorrent](https://github.com/webtorrent/webtorrent). The UI is designed to be simple, and keyboard controlled. The intention is to install Surge on a raspberry pi, or similar, that is plugged into a home theater system, then controlled with [Unified Romote](https://www.unifiedremote.com/), or a small wireless keyboard. *Using Surge, you can watch torrents from the comfort of your couch.*

*Surge was inspired by:* [https://github.com/Bugswriter/notflix](https://github.com/Bugswriter/notflix)

```Currently only supported on linux```
## How does it work?
1. When you search, Surge scrapes [1337x](https://1337x.wtf/) for magnet links matching your search query.
2. When you select a torrent, Surge uses node ```child_process``` to start the webtorrent stream in the background, and send the stream to MPV.

Therefore, surge is a really complicated way of running
```
$ webtorrent <magnet link> --mpv
```
## Dependancies

- [WebTorrent](https://github.com/webtorrent/webtorrent)

- [MPV](https://mpv.io/)


If you want to use Surge, there is a Linux Appimage in [releases](https://github.com/trentslutzky/surge-torrent-streaming/releases). Or you can clone this repo and do whatever with it.


## Find a torrent in seconds:
<img src="https://github.com/trentslutzky/surge-torrent-streaming/blob/main/repo/demo.gif" width="600">


## todo
- Add support for other video players (VLC)
- Add support for scraping other trackers (RARBG, rutracker, etc.)
- Electron makes the app *huge*. Maybe switch to [Tauri](https://github.com/tauri-apps/tauri)
