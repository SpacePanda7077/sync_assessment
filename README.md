The synchronization architecture uses a server-authoritative model with client-side prediction and server reconciliation.

The client immediately simulates player movement locally to keep controls responsive, instead of waiting for the server response. Every input sent to the server is stored in an input buffer with a sequence number. When the server responds with the latest authoritative player position and the last processed input sequence, the client removes acknowledged inputs from the buffer, resets the predicted position to the server position, and replays all unacknowledged inputs to reconstruct the current predicted state.

For movement smoothing, the local player uses interpolation toward a predicted target position, while remote players use linear interpolation between their current and latest server positions. This reduces visible jitter caused by network latency and packet arrival intervals.

To handle desynchronization, the client continuously calculates the positional error between the local predicted position and the server-authoritative position. If the error exceeds a threshold, the player is snapped back to the server position. A small “network breathing space” is included in the threshold to tolerate minor latency fluctuations without unnecessary corrections (Note : threshold is determined by Server tickrate which is 20Hz(50ms) plus network breathing space(10ms) ) .

The architecture is designed around a fixed tick simulation running at 20Hz to keep updates consistent between client and server. Although the implementation is not fully deterministic, the fixed update loop improves synchronization consistency and makes replay-based reconciliation possible.

Overall, the approach balances:

Responsiveness through client-side prediction

Accuracy through server authority

Smoothness through interpolation

Consistency through reconciliation and desync correction
