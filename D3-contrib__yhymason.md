For deliverable d3, this commit received a grade of 98%.
Test summary: 100% (62 passing, 0 failing, 0 skipped)
Line coverage: 85%
For D3 my major focus is implementing server.ts and the validation part for TRANSFORMATION.
We managed to hit 100% tests pass pretty early but we encountered some issues that causes certain tests from d1 and d2 to timeout.
The problem is essentially affected by setting courses_uuid to string in our dataset so that double negation somehow takes very long time
to excute, the rest of time before due date for D3 will be used for debugging this issue.
Overall, I think we did pretty well as a team for this deliverable.
My main commit would be:
https://github.com/CS310-2017Jan/cpsc310project_team185/commit/466dd2b792c34b4a6fa83a59ad6c967e8fa2f5ab
and:
https://github.com/CS310-2017Jan/cpsc310project_team185/commit/90f47c018510ef4d52ea4b1080c269c4537bbfd9
