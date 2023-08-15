# solr-plant-patents

## Introduction

This repository contains the data and tools needed to generate a
"solar-plant-patents" Docker image, consisting of a Solr core populated with
metadata from the Plant Patents Digitization Project.

When making updates to the data or configuration, a new Docker image should be
created.

## Plant Patents Ingest Procedures

The following procedures are intended to be performed by the "dpiprocessing"
service account on the "libdpiprocessing.lib.umd.edu" server.

The setup of the libdpiprocessing.lib.umd.edu server is outlined in
[docs/procedures/libdpiprocessing_server_setup.md](docs/procedures/libdpiprocessing_server_setup.md)

Typically, both Plant Patents PDF scans and the associated Plant Patents
metadata provied by STEM are updated simultaneously, in which case both of the
following procedures should be used:

* [Add Plant Patents PDF Scans](docs/procedures/Add_Plant_Patents_PDF_Scans.md) -
  Uploads Plant Patents PDF scans and updates "data.csv" file with data
  regarding the scans.

* [Patents Metadata Update](docs/procedures/Patents_Metadata_Update.md) -
  Updates the "data.csv" file with the Plant Patents metadata provied by STEM.

## data.csv File

The "data.csv" file contains both "publishable" and "work-in-progess" records
derived from the Plant Patents metadata provided by STEM.

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

**Note:** As of August 15, 2023, Docker appears to have intermittent problems
building the "solr-plant-patents" Docker image on M-Series (Apple Silicon)
MacBooks.

The Docker image for production use should be built in Kubernetes (see
<https://github.com/umd-lib/k8s/blob/main/docs/DockerBuilds.md> for more
information and prerequisites).

When building the Docker image, the "data.csv" file will be used to populate the
Solr database.

To build the Docker image named "docker.lib.umd.edu/solr-plant-patents":

```zsh
$ kubectl config use-context build
$ docker buildx build . --builder=kube -t docker.lib.umd.edu/solr-plant-patents --push
```

The Docker image will be automatically pushed to the Nexus.

To run the freshly built Docker container on port 8983:

```zsh
$ docker run -it --rm -p 8983:8983 docker.lib.umd.edu/solr-plant-patents
```

The Solr application should be available at <http://localhost:8983/solr>.

----

**Note:** If running on an M-Series Macbook, and Solr does not seem to start
(or does not become available at <http://localhost:8983/solr>) try running the
command with the "SOLR_JAVA_STACK_SIZE" environment variable set:

```zsh
$ docker run -it --rm -p 8983:8983 -e SOLR_JAVA_STACK_SIZE='-Xss512k' docker.lib.umd.edu/solr-plant-patents
```

The use of the `-e SOLR_JAVA_STACK_SIZE=-Xss512k` when running on M-Series
MacBooks was suggested by <https://stackoverflow.com/a/70217469>.

----

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

### "validator_data_for_publication_csv" Stage

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
