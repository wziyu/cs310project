For deliverable d3, this commit received a grade of 98%.

Test summary: 100% (62 passing, 0 failing, 0 skipped) Line coverage: 85%
For D3 my major job is adding group by and apply function and making small modification to other parts of the perform query so the extended transformation part of the new query can be supplied.
We passed all the tests for d3 by Thursday but found that the autotest for some cases of d1 would time out. Later we spent 2 days to find the reason, which is due to the comparing speed between string 
is much slower than number (since we changed the uuid in our dataset from number to string this time) and fixed this bug. Overall, I think we did good cooperation for this deliverable. 
My main commit would be : https://github.com/CS310-2017Jan/cpsc310project_team185/commit/a64a56d7bfe8035a1a8d9e4425efcb0763a5063e     https://github.com/CS310-2017Jan/cpsc310project_team185/commit/8a6bb2a9b6cfd0067168b6ba8034d97053f30ef6