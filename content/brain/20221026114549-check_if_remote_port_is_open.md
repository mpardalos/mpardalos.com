+++
title = "Check if remote port is open"
author = ["Michalis Pardalos"]
tags = ["publish"]
draft = false
+++

There is multiple ways to check if a remote port is open from a linux command line

-   nmap
-   telnet
    ```sh
    telnet <server> <port>
    ```
-   curl
    ```sh
    curl -v telnet://<server>:<port>
    ```
