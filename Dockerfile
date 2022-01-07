# Dockerfile for the solr-plant-patents Docker image
#
# To build:
#
# docker build -t docker.lib.umd.edu/solr-plant-patents:<VERSION> -f Dockerfile .
#
# where <VERSION> is the Docker image version to create.

FROM docker.lib.umd.edu/csv-validator:1.1.5-umd-0 as validator

# Add the files
COPY data.csv /tmp/data.csv
COPY data.csvs /tmp/data.csvs

RUN validate /tmp/data.csv /tmp/data.csvs

FROM solr:8.11.0@sha256:f9f6eed52e186f8e8ca0d4b7eae1acdbb94ad382c4d84c8220d78e3020d746c6 as builder

# Switch to root user
USER root

# Install xmlstarlet
RUN apt-get update -y && \
    apt-get install -y xmlstarlet

# Set the SOLR_HOME directory env variable
ENV SOLR_HOME=/apps/solr/data

RUN mkdir -p /apps/solr/ && \
    cp -r /opt/solr/server/solr /apps/solr/data && \
    wget --directory-prefix=/apps/solr/data/lib "https://maven.lib.umd.edu/nexus/repository/releases/edu/umd/lib/umd-solr/2.2.2-2.4/umd-solr-2.2.2-2.4.jar" && \
    wget --directory-prefix=/apps/solr/data/lib "https://maven.lib.umd.edu/nexus/repository/central/joda-time/joda-time/2.2/joda-time-2.2.jar" && \
    chown -R solr:0 "$SOLR_HOME"

# Switch back to solr user
USER solr

# Create the "plant-patents" core
RUN /opt/solr/bin/solr start && \
    /opt/solr/bin/solr create_core -c plant-patents && \
    /opt/solr/bin/solr stop
# Replace the schema file
COPY conf /apps/solr/data/plant-patents/conf/

# Add the data to be loaded
COPY --from=validator /tmp/data.csv /tmp/data.csv

# Load the data to plant-patents core
RUN /opt/solr/bin/solr start && sleep 3 && \
    curl 'http://localhost:8983/solr/plant-patents/update?commit=true' -H 'Content-Type: text/xml' --data-binary '<delete><query>*:*</query></delete>' && \
    curl -v "http://localhost:8983/solr/plant-patents/update/csv?commit=true&f.inventor.split=true&f.inventor.separator=;&f.city.split=true&f.city.separator=;&f.state.split=true&f.state.separator=;&f.country.split=true&f.country.separator=;" \
    --data-binary @/tmp/data.csv -H 'Content-type:text/csv; charset=utf-8' && \
    /opt/solr/bin/solr stop

FROM solr:8.11.0-slim@sha256:530547ad87f3fb02ed9fbbdbf40c0bfbfd8a0b472d8fea5920a87ec65aaacaef

ENV SOLR_HOME=/apps/solr/data

USER root
RUN mkdir -p /apps/solr/

USER solr
COPY --from=builder /apps/solr/ /apps/solr/
