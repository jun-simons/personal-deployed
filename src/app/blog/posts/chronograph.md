---
title: "ChronoGraph: A Versioned Graph Library"
date: "2025-05-08"
tag:   "project"
---

*GitHub, but for Graphs.*

[<ins><b>ChronoGraph</b></ins>](https://github.com/jun-simons/ChronoGraph) is a graph library for *Versioned Graphs* written in C++. It supports standard graph operations and algorithms, and all changes made to a graph are stored as *events* with associated timestamps. The API is also made accessable to Python via PyBind11.

Graphs are created as repositories, for which the library supports:
- Commit handling and organization
- Branch creation and checkout
- Merging branches and resolving merge conflicts
- Diff two versions or branches of the graph
- *Snapshot History*: view the graph at any point in time
- *Graph Replay*: replay graph events between two time points
- *Temporal Algorithms*: time-respecting graph algorithms

ChronoGraph requires C++17 support and CMake 3.14 or later.

Potential use cases for this library include social networks, financial transactions, and anything where a graph would evolve over time. The branching feature also allows multiple simultaneous users to work on separate branches and merge changes.

Importantly, ChronoGraph implements *checkpointing* to save occasional copies of the graph state after large numbers of events occur.  To obtain snapshots or checkout branches from earlier or later times, it uses a combination of loading the nearest checkpoint and replaying graph events to obtain the correct state.

Standard graph algorithms are supported, including connectivity and components, reachability, pathfinding, and cycles. *Temporal Algorithms* use graph event timestamps to determine time-respecting reachability, time-respecting Djikstra's and running algorithms at past points in time.

[<ins>View on GitHub</ins>](https://github.com/jun-simons/ChronoGraph)
