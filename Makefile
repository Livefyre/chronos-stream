.PHONY: all build

all: build

build: node_modules

dist: build
	mkdir -p dist && ./node_modules/.bin/browserify -s chronos-stream index.js -o dist/chronos-stream.js

watch: build
	./node_modules/.bin/watchify -s chronos-stream index.js -o dist/chronos-stream.js

# if package.json changes, install
node_modules: package.json
	npm install
	touch $@

server: build
	npm start

test: build
	# uses karma start
	npm test

clean:
	rm -rf node_modules dist

package: dist

env=dev
deploy: dist
	./node_modules/.bin/lfcdn -e $(env)

