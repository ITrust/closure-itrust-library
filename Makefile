
TAR ?= tar
VERSION = $(shell cat VERSION)

.PHONY: archive clean

archive:
	mkdir -p dist
	tar -czf dist/closure-itrust-library_$(VERSION).tar.gz \
	    VERSION README.md closure

clean:
	rm -Rf dist
