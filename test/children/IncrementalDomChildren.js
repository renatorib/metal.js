'use strict';

import dom from 'metal-dom';
import Component from 'metal-component';
import IncrementalDomChildren from '../../src/children/IncrementalDomChildren';

describe('IncrementalDomChildren', function() {
	it('should capture children calls to incremental dom', function(done) {
		var renderer = {
			buildKey: sinon.stub()
		};

		IncrementalDomChildren.capture(renderer, function(tree) {
			assert.strictEqual(1, tree.config.children.length);

			var node = tree.config.children[0];
			assert.ok(!node.text);
			assert.strictEqual('span', node.tag);
			assert.ok(node.config);
			assert.strictEqual('key', node.config.key);
			assert.deepEqual('test', node.config.class);
			assert.strictEqual('bar', node.config.foo);

			assert.strictEqual(1, node.config.children.length);
			assert.strictEqual('Hello World', node.config.children[0].text);
			done();
		});

		IncrementalDOM.elementOpen('span', 'key', ['class', 'test'], 'foo', 'bar');
		IncrementalDOM.text('Hello World');
		IncrementalDOM.elementClose('span');
		IncrementalDOM.elementClose('div');
	});

	it('should set keys of component calls according to result of "buildKey" function', function(done) {
		var counter = 0;
		var renderer = {
			buildKey: () => 'key' + counter++
		};

		IncrementalDomChildren.capture(renderer, function(tree) {
			assert.strictEqual(1, tree.config.children.length);

			var node = tree.config.children[0];
			assert.strictEqual('span', node.tag);
			assert.ok(!node.config.key);

			assert.strictEqual(2, node.config.children.length);
			assert.strictEqual(Component, node.config.children[0].tag);
			assert.strictEqual('key0', node.config.children[0].config.key);
			assert.strictEqual(Component, node.config.children[1].tag);
			assert.strictEqual('key1', node.config.children[1].config.key);
			done();
		});

		IncrementalDOM.elementOpen('span');
		IncrementalDOM.elementVoid(Component);
		IncrementalDOM.elementVoid(Component);
		IncrementalDOM.elementClose('span');
		IncrementalDOM.elementClose('div');
	});

	it('should store args for text nodes when they contain more than just the text', function(done) {
		var renderer = {
			buildKey: sinon.stub()
		};

		IncrementalDomChildren.capture(renderer, function(tree) {
			var node = tree.config.children[0];
			assert.strictEqual('No args', node.text);
			assert.ok(!node.args);

			node = tree.config.children[1];
			assert.strictEqual('With args', node.text);
			assert.deepEqual([
				node.text,
				formatFn
			], node.args);
			done();
		});

		var formatFn = val => val;
		IncrementalDOM.text('No args');
		IncrementalDOM.text('With args', formatFn);
		IncrementalDOM.elementClose('div');
	});

	it('should render captured children via incremental dom', function() {
		var element = document.createElement('div');

		IncrementalDOM.patch(element, () => {
			IncrementalDomChildren.render({
				tag: 'span',
				config: {
					children: [
						{
							args: ['Hello World'],
							text: 'Hello World'
						}
					],
					class: 'test',
					foo: 'bar',
					key: 'key'
				}
			});
		});

		assert.strictEqual(1, element.childNodes.length);

		var spanElement = element.childNodes[0];
		assert.strictEqual('SPAN', spanElement.tagName);
		assert.ok(dom.hasClass(spanElement, 'test'));
		assert.strictEqual('bar', spanElement.getAttribute('foo'));
		assert.strictEqual(1, spanElement.childNodes.length);
		assert.strictEqual('Hello World', spanElement.childNodes[0].textContent);
	});

	it('should skip rendering children node when skipNode function returns true', function() {
		var element = document.createElement('div');

		function skipNode(node) {
			if (node.config && node.config.id === 'skip') {
				return true;
			}
		}
		IncrementalDOM.patch(element, () => {
			IncrementalDomChildren.render({
				tag: 'span',
				config: {
					children: [
						{
							tag: 'span',
							config: {
								id: 'beforeSkip'
							}
						},
						{
							tag: 'span',
							config: {
								id: 'skip'
							}
						},
						{
							tag: 'span',
							config: {
								id: 'afterSkip'
							}
						}
					],
					id: 'parent'
				}
			}, skipNode);
		});

		assert.strictEqual(1, element.childNodes.length);

		var child = element.childNodes[0];
		assert.strictEqual(2, child.childNodes.length);
		assert.strictEqual('beforeSkip', child.childNodes[0].id);
		assert.strictEqual('afterSkip', child.childNodes[1].id);
	});

	it('should render text nodes that have been changed after capture', function(done) {
		var renderer = {
			buildKey: sinon.stub()
		};

		IncrementalDomChildren.capture(renderer, function(tree) {
			var element = document.createElement('div');
			tree.config.children[0].text = 'New Text';
			IncrementalDOM.patch(element, () => {
				IncrementalDomChildren.render(tree.config.children[0]);
			});

			assert.strictEqual(1, element.childNodes.length);
			assert.strictEqual('New Text Formatted', element.childNodes[0].textContent);
			done();
		});

		IncrementalDOM.text('Hello World', val => val + ' Formatted');
		IncrementalDOM.elementClose('div');
	});
});
