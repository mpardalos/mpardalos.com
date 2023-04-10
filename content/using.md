---
title: The tools I like to use
---

## Software

I am always looking for ways to improve my workflow, and therefore I am curious about new tools and approaches. This section reflects what I have settled on for the time being.

### Emacs

While I am not one of the \"living in Emacs\" types, I certainly have a good chunk of my computing life in Emacs. I use it as my programming editor, with [lsp-mode](https://emacs-lsp.github.io/lsp-mode/) taking care of integrating with various programming languages. It also holds my notes using [org-mode](https://orgmode.org/) and [org-roam](https://www.orgroam.com/). My configuration is based on [doom-emacs](https://github.com/doomemacs/doomemacs).

I have so far avoided bringing into Emacs things that I feel are outside the scope of an editor, such music playback ([emms](https://www.gnu.org/software/emms/)) or email ([mu4e](https://www.emacswiki.org/emacs/mu4e)), although the work by Nicolas Rougier on [nano-emacs](https://github.com/rougier/nano-emacs) and [nano-mu4e](https://github.com/rougier/nano-emacs/blob/master/nano-mu4e.el), has been tempting me to change that.

### Fedora Linux

I have been using Linux for almost a decade now, and most of that time has been spent on Arch Linux. I loved the minimal base system, and how it would get me to experiment with my computing setup; I was always trying different window managers and writing little utility scripts to manage various things about my computer. This, however, was also the reason I moved away from it. I felt I was spending too much time experimenting with my setup and not enough time getting actual work done. When it came time to work on my Master\'s thesis, I realised that would be a problem. Switching to a curated environment like Fedora got me to stop tweaking my tools and actually use them instead --- and I still have Emacs to scratch my tweaking itch with.

### Haskell

My go-to programming language. If I get free choice of language for a project, and performance is not a top priority (see: Rust), I am choosing Haskell. I find that, much more than other languages, Haskell structures my thinking. Because of the strong type system, I can usually sketch out what I am going to do using only types, before I have written any functionality. Once I have that down, I find that the implementation almost falls out automatically. This process means that I usually end up with programs that are much easier to understand.

I absolutely have my complaints with the language (poor documentation, often abandoned libraries, terrible debugging story),  the positives far outweigh the negatives.

### Rust

My language of choice for personal projects for the last few years has been Haskell, which I was using to develop [Kima](https://kima.xyz). Rust has been on my radar for a long time and I have been intrigued by its promise of combining modern language features with the performance of C/C++. I finally got around to using it for a project and I have to say it is everything I was hoping for. You get great performance writing \"obvious\" code, and there is a clear path for further optimising from there --- as opposed to my experience with Haskell where optimising could mean starting at GHC Core. At the same time, it provides high level language features like traits, sum types (enums), and *sane* macros (unlike the C preprocessor). The combination sometimes makes the performance of the resulting executables seem like magic.
