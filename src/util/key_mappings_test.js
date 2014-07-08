glift.keyMappingsTest = function() {
  module('Key Mappings Test Suite');
  var keyMappings = glift.keyMappings;

  test('NameToCode', function() {
    deepEqual(keyMappings.nameToCode('ARROW_LEFT'), 37);
    deepEqual(keyMappings.nameToCode('ARROW_UP'), 38);
    deepEqual(keyMappings.nameToCode('ARROW_RIGHT'), 39);
    deepEqual(keyMappings.nameToCode('ARROW_DOWN'), 40);
  });

  test('CodeToName', function() {
    deepEqual(keyMappings.codeToName(37), 'ARROW_LEFT');
    deepEqual(keyMappings.codeToName(38), 'ARROW_UP');
    deepEqual(keyMappings.codeToName(39),'ARROW_RIGHT');
    deepEqual(keyMappings.codeToName(40), 'ARROW_DOWN');
  });

  test('Register / Get Key Action / Unregister', function() {
    var id = 'foo-id';
    var iconPath = 'zed';
    var keyName = 'ARROW_DOWN';

    glift.keyMappings.registerKeyAction(id, 'garg', iconPath);
    deepEqual(keyMappings.getFuncOrIcon(id, 'garg'), null, 
        'shouldn\'t be registered -- bad icon name');

    glift.keyMappings.registerKeyAction(id, keyName, iconPath);
    deepEqual(keyMappings.getFuncOrIcon(id, keyName), iconPath, 
        'iconPath should be registered now');

    glift.keyMappings.unregisterInstance(id);
    deepEqual(keyMappings.getFuncOrIcon(id, keyName), null, 
        'iconPath should be unregistered now');
  });
};
