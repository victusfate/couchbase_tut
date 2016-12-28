# couchbase_tut

results for 100k json documents, total data size 400MB using my local 2012 Macbook Pro 
  * config: single bucket, lots of ram for data (2GB) and indexes (2GB)
  * n1ql : 2-9s per query for a between latitude,longitude order by timestamp and limit using appropriate indexes for latitude, longitude. Sorting is done independent of timestamp index but I added one just in case.
  * n1ql : covered index responding with only limited data ran in 180-200ms on my local system. Explored compound indexes ts_longitude_latitude_id to get that result
  * spatial view + client side sorting : ran 100 queries in 10 seconds, 10 queries / second
  
  
