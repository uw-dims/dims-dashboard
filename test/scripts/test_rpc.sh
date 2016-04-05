#! /bin/bash

anon_client --server=192.168.56.103 -d -v \
  -m $GIT/dims-dashboard/initial_data/data/ipgrep_networks_fromdashboard.yml \
  -r $GIT/dims-dashboard/initial_data/mydata/dataFiles/rwfind_201210011617_8428.txt \
  -q anon_test

cifbulk_client --server=192.168.56.103 -d -v \
  -r $GIT/dims-dashboard/test/data/cifbulk_1.txt \
  -q cifbulk_v1_test

crosscor_client --server=192.168.56.103 -d -v \
  -m $GIT/dims-dashboard/initial_data/data/ipgrep_networks_fromdashboard.yml \
  --iff=friend \
  -r $GIT/dims-dashboard/initial_data/mydata/dataFiles/rwfind_201210011617_8428.txt \
  -q crosscor_test
