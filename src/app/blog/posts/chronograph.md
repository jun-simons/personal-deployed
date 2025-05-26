---
title: "ChronoGraph: A Versioned Graph Library"
date: "2025-05-08"
tag:   "project"
---

*GitHub, but for Graphs.*

[<ins><b>ChronoGraph</b></ins>](https://github.com/jun-simons/ChronoGraph) is a graph library for *Versioned Graphs* written in C++. It supports standard graph operations and algorithms, and all changes made to a graph are stored as *events* with associated timestamps.  

Graphs are created as repositories, for which the library supports:
- Commit handling and organization
- Branch creation and checkout
- Merging branches and resolving merge conflicts
- Diff two versions or branches of the graph
- *Snapshot History*: view the graph at any point in time
- *Graph Replay*: replay graph events between two time points

ChronoGraph requires C++17 support and CMake 3.14 or later.

Potential use cases for this library include social networks, financial transactions, and anything where a graph would evolve over time. The branching feature also allows multiple simultaneous users to work on separate branches and merge changes.

Importantly, ChronoGraph implements *checkpointing* to save occasional copies of the graph state after large numbers of events occur.  To obtain snapshots or checkout branches from earlier or later times, it uses a combination of loading the nearest checkpoint and replaying graph events to obtain the correct state.

[<ins>View on GitHub</ins>](https://github.com/jun-simons/ChronoGraph)
