(function() {
  module('glift.rules.movenodeTest');
  test('Basic Creation Test', function() {
    var node = glift.rules.movenode();
    ok(node !== undefined, 'Must not be undefined');
  });

  test('SetNodeId', function() {
    var node = glift.rules.movenode();
    node.setNodeId_(4, 3);
    deepEqual(node.getNodeNum(), 4, 'NodeNum');
    deepEqual(node.getVarNum(), 3, 'VarNum');
  });

  test('Get Child', function() {
    var node = glift.rules.movenode();
    node.addChild().addChild();
    var child = node.getChild(1);
    deepEqual(child.getNodeNum(), 1, 'Child NodeNum');
    deepEqual(child.getVarNum(), 1, 'Child VarNum');
  });
})();
