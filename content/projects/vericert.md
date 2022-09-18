---
title: Vericert
description: 
category: current
---

For my Master's thesis I worked on implementing a *resource sharing* optimisation to the [Vericert High Level Synthesis](https://vericert.ymhg.org/) compiler.

Vericert is a formally verified, high level synthesis compiler for C. This means it compiles C down to Verilog, a hardware description language, generating hardware that is equivalent to the input C code. The translation is formally verified using the Coq proof assistant. This means it has been mathematically proven to never incorrectly compile a program.

My work was to add an optimisation, *resource sharing*, making the compiler generate more compact hardware, and prove it correct. I am currently working on completing this proof as part of an Undergraduate Research Opportunity in Imperial College London.

This work was published as a short paper in FCCM 2022. You can read the paper [here](/fccm22_verified_resource_sharing.pdf)

You can read my master's thesis [here](/thesis.pdf)
