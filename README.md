# solr-plant-patents

## Introduction

This repository contains the data and tools needed to generate a
"solar-plant-patents" Docker image, consisting of a Solr core populated with
metadata from the Plant Patents Digitization Project.

When making updates to the data or configuration, a new Docker image should be
created.

## data.csv File

The "data.csv" file contains both "publishable" and "work-in-progess" records
derived from the Plant Patents metadata provided by STEM. See the
"plant-patents-ingest" repository
<https://github.com/umd-lib/plant-patents-ingest>) for information on generating
this file.

As part of the Docker build, the "work-in-progress" records will be filtered
out (using the "filter_for_publication" command from "plant-patents-ingest"),
so the actual number of records in the Solr database will likely be fewer.

**Note:** The "data.csv" file should not be "hand-edited", as it is updated
using automatic processes.

## CSV Schema Files

The following files use the "CSV Schema Language v1.1"
(<https://digital-preservation.github.io/csv-schema/csv-schema-1.1.html>) to
verify the data files used for generating the Solr code:

* patents_metadata.csvs: Validates the "patents_metadata.csv" file provided by
   STEM. The validation of the "patents_metadata.csv" file occurs outside the
   Docker build.
* data.csvs: Validates the raw "data.csv" file containing both "publishable" and
    "work-in-progress" records.
* data_for_publication.csvs: Validates the "publishable" records after the
    "data.csv" file has been filtered.

The "csv-validator-docker" Docker image from
<https://github.com/umd-lib/csv-validator-docker> is used to perform the actual
validation. This Docker image uses the "csv-validator" tool
(<http://digital-preservation.github.io/csv-validator/> )provided by
The National Archives of the UK.

## Building the Docker Image

When building the Docker image, the "data.csv" file will be used to populate the
Solr database.

To build the Docker image named "docker.lib.umd.edu/solr-plant-patents":

```bash
> docker build -t docker.lib.umd.edu/solr-plant-patents .
```

To run the freshly built Docker container on port 8983:

```bash
> docker run -it --rm -p 8983:8983 docker.lib.umd.edu/solr-plant-patents
```

## Docker Build Stages

The Docker image is created using a Docker multi-stage build.

The following stages are used:

### "validator_data_csv" Stage

This stage uses the "docker.lib.umd.edu/csv-validator" Docker image
to validate the raw "data.csv" file using the "data.csvs" CSV schema file. If
the validation fails, the Docker build will halt with a validation error
message.

### "filter_for_publication" Stage

This stage uses the "filter_for_publication" command from the
"docker.lib.umd.edu/plant-patents-ingest" Docker image to
filter the raw "data.csv" file, generating a "data_for_publication.csv"
containing the records to include in the Solr core.

### "validator_date_for_publication_csv" Stage

This stage uses the "docker.lib.umd.edu/csv-validator" Docker image to validate
the "data_for_publication.csv" file using the "data_for_publication.csvs" CSV
schema file. If the validation fails, the Docker build will halt with a
validation error message.

### "builder" Stage

This stage constructs the actual "solr-plant-patents" Docker image, starting
with an official Solr Docker image as the base image the Solr core, and
populating it with the data from the "data_for_publication.csv" file.

## License

See the [LICENSE](LICENSE.txt) file for license rights and limitations.
