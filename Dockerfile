FROM ruby:2.3-alpine

MAINTAINER himuhasib@gmail.com

RUN apk add --no-cache nodejs curl git
RUN gem install dpl rendezvous multipart-post faraday
