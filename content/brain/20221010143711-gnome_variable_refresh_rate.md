+++
title = "Gnome variable refresh rate"
author = ["Michalis Pardalos"]
tags = ["publish"]
draft = false
+++

This is currently in testing for Gnome, but there is a COPR repo for fedora to try it now:


## COPR notes {#copr-notes}

Provides Mutter &amp; GNOME Control Center with Dor Askayo's Wayland VRR MR applied.
Use at your own risk, this MR is in testing. Please avoid commenting in the GNOME Gitlab unless you're absolutely certain you've found an issue with the MR.


### Installation Instructions {#installation-instructions}

Firstly add the Copr repository to your system:

```sh
sudo dnf copr enable kylegospo/gnome-vrr
```

After adding the repository, update your mutter and gnome-control-center packages:

```sh
sudo dnf update --refresh
```


### Reverting {#reverting}

If you wish to go back to stock, first disable the Copr repo:

```sh
sudo dnf copr disable kylegospo/gnome-vrr
```

Then roll back the packages that were updated with:

```sh
sudo dnf distro-sync --refresh
```
