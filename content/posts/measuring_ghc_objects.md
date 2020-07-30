---
title: Measuring memory usage of Haskell values
draft: true
---

As part of my Google Summer of Code project on ghcide, I had to measure the size of Haskell values in memory. After getting blocked by a bug in GHC's primops I fell down a rabbit hole of learning about GHC's memory layout, Cmm and making my first contribution to GHC.

It all started with one of my GSoC mentors, Matthew Pickering, suggesting that I use the [ghc-datasize](https:github.com/def-/ghc-datasize) to measure the in-memory size of a large hashmap that is at the core of ghcide. The library requires GHC 8.6 but looking at its code it seemed like it should work with a newer GHC and it, being a single file, seemed simple enough to just copy as-is, which I did.

I set up a thread using the async library to regularly run the `recursiveClosureSize` function on the hashmap in question and print the result to stdout. The code compiled, a promising sign, but I was then greeted by the following error, and no size measurements.
```
closurePtrs: Cannot handle type SMALL_MUT_ARR_PTRS_FROZEN_CLEAN yet
```
Looking at the `recursiveClosureSize` function showed nothing that could throw this error, but the fact that it was calling a primop, `unpackClosure#` seemed suspicious. I decided to grep for the error in GHC, and sure enough, it is an error message printed by `heap_view_closurePtrs`  in the RTS, which is used by the `unpackClosure#` primop. Looking through GHC's git history showed that this function did not support any of the `SMALL_MUT_ARR_PTRS_*` closure types until GHC 8.10. Switching to GHC 8.10.1 stopped the error and showed some memory size measurements being printed and stopped the error. Success!

Except not so fast.
