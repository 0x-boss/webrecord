# Running webrecord with Docker

This repo uses Playwright to record a webpage to `./videos/recording.mp4`. There are two Docker approaches provided:

Build the image:

```bash
docker build -t webrecord .
```

Run the container and mount the `videos/` folder so recordings persist on the host:

```bash
mkdir -p videos
docker run --rm -v "$(pwd)/videos:/usr/src/app/videos" webrecord
```

You can also use docker-compose:

```bash
docker-compose up --build
```

2) Alternative — slim Node image + Chromium deps
------------------------------------------------

If you prefer a smaller base image or want to control which system packages are installed, the repository includes `Dockerfile.debian` which is based on `node:24-bullseye-slim`. It installs common Chromium/ffmpeg libraries, installs Node dependencies, and runs `npx playwright install --with-deps` to fetch browser binaries.

Build the alternative image:

```bash
docker build -f Dockerfile.debian -t webrecord:debian .
```

Run it (persist videos to host):

```bash
mkdir -p videos
docker run --rm -v "$(pwd)/videos:/usr/src/app/videos" webrecord:debian
```

About `install-chromium-deps.sh`
--------------------------------

There is a host-oriented helper script (`install-chromium-deps.sh`) that installs Chromium dependencies and sets up `nvm`/Node for a native Ubuntu host. It's useful if you want to run the app outside Docker on an Ubuntu machine. Note:

- Package names can vary across distros and releases; if `apt` fails for a package name, remove suffixes or check the correct name for your distro.
- For Docker-based builds the Playwright image is generally easier since it already bundles dependencies.

Verification steps (on your machine)
-----------------------------------
1. Ensure Docker is installed and running on your host.
2. From the project root run either:

```bash
# build and run using Playwright base image
docker build -t webrecord .
docker run --rm -v "$(pwd)/videos:/usr/src/app/videos" webrecord

# OR build the Debian-based image
docker build -f Dockerfile.debian -t webrecord:debian .
docker run --rm -v "$(pwd)/videos:/usr/src/app/videos" webrecord:debian
```

Notes about local verification from this environment
---------------------------------------------------
I attempted to run `docker --version` here to build and test, but Docker is not installed in this environment, so I couldn't perform the build locally. The files added are ready for you to run on your machine with Docker.
