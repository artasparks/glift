(function() {
  module('glift.displays.svg.idsTest');
  var idGen = glift.displays.svg.ids.gen('foo');
  var pt = glift.util.point(0, 1);
  var name = 'start';

  test('Testing to ensure all groups are defined', function() {
    deepEqual(idGen.svg(), 'foo_svg', 'svg');
    deepEqual(idGen.board(), 'foo_board', 'board');
    deepEqual(idGen.stoneGroup(), 'foo_stone_container', 'stonegroup');
    deepEqual(idGen.stone(pt), 'foo_stone_0_1', 'stone');
    deepEqual(idGen.stoneShadowGroup(), 'foo_stone_shadow_container', 'shadow gp');
    deepEqual(idGen.stoneShadow(pt), 'foo_stone_shadow_0_1', 'shadow');
    deepEqual(idGen.starpointGroup(), 'foo_starpoint_container', 'starpoint gp');
    deepEqual(idGen.starpoint(pt), 'foo_starpoint_0_1', 'starpoint');
    deepEqual(idGen.buttonGroup(), 'foo_button_container', 'button group');
    deepEqual(idGen.button(pt), 'foo_button_0_1', 'button');
    deepEqual(idGen.lineGroup(), 'foo_board_line_container', 'line grp');
    deepEqual(idGen.line(pt), 'foo_board_line_0_1', 'line');
    deepEqual(idGen.markGroup(), 'foo_mark_container', 'mark group');
    deepEqual(idGen.mark(pt), 'foo_mark_0_1', 'mark');
    deepEqual(idGen.guideLine(), 'foo_guide_line', 'guide line');
    deepEqual(idGen.iconGroup(), 'foo_icon_container', 'icon group');
    deepEqual(idGen.icon(name), 'foo_icon_start', 'icon');
    deepEqual(idGen.tempIconGroup(), 'foo_temp_icon_container', 'tmp icon grp');
    deepEqual(idGen.tempIcon(name), 'foo_temp_icon_start', 'tmp icon');
    deepEqual(idGen.tempIconText(name), 'foo_temp_text_start', 'tmp text');
  });
})();
