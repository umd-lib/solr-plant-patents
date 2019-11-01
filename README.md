# solr-plant-patents

## Introduction

Note: Previous versions of this repository were used as a Solr configuration
directory on solr.lib.umd.edu. This repository has now been changed to support
creating a Docker image containing the data.

When making updates to the data or configuration, a new Docker image should be
created.

## Workflow for updating the data (i.e. adding new patents)

The following steps for updating the data were taken from
[SolrDB Project: Plant Patents Image Database](https://confluence.umd.edu/display/LIB/SolrDB+Project%3A+Plant+Patents+Image+Database):

1) Distribute binaries into correctly named folders (100 files per folder, with
   folders named according to the first patent number in the folder,
   zero-padded to five digits).
   
2) Rsync binaries to the wwwprod server:

    * Use rsync to load the binaries to wwwstage
    * Due to security restrictions on the production server, SSDR will need to
      promote the binaries from wwwstage to wwwprod.

3) Use the preprocessor script locally to generate an updated metadata CSV that
   includes metadata for all scanned patents.

4) Upload the CSV to the Solr server using the following instructions:

    ```
    # copy the metadata spreadsheet to the server
    scp path/to/local/spreadsheet.csv solr.lib.umd.edu:~/
     
    # connect to the server via ssh
    ssh solr.lib.umd.edu
     
    # zero out the existing core data
    curl http://localhost:8983/solr/plant-patents/update -H "Content-type: text/xml" --data-binary '<delete><query>*:*</query></delete>'
    curl http://localhost:8983/solr/plant-patents/update -H "Content-type: text/xml" --data-binary '<commit />'
     
    # use curl to load the spreadsheet to localhost (split the inventor, city, state, and country fields on semicolons)
    curl -v "http://localhost:8983/solr/plant-patents/update/csv?commit=true\
        &f.inventor.split=true&f.inventor.separator=;\
        &f.city.split=true&f.city.separator=;\
        &f.state.split=true&f.state.separator=;\
        &f.country.split=true&f.country.separator=;" \
        --data-binary @metadata.csv -H 'Content-type:text/csv; charset=utf-8'
   ```
   
## Building the Docker Image

When building the Docker image, the "data.csv" file will be used to populate the Solr database.

To build the Docker image named "solr-plant-patents":

```
> docker build -t solr-plant-patents .
```

To run the freshly built Docker container on port 8983:

```
> docker run -it --rm -p 8983:8983 solr-plant-patents
```