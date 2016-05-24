# Glift: Positioning and Sizing Guide

## Sizing

Before a Glift instance is created, Glift finds the size of the enclosing HTML
element. Thus, it examines the enclosing element, gets the computed height and
width, and then uses these dimensions to start the calculation.

**The most common problem is that the height of the element is 0, and so
you'll get an error like:**

```
Uncaught Error: Div for Glift has has invalid dimensions. Bounding box had width: 1200, height: 0
```

Make to give the element a `height` or `min-height` in your CSS or directly on
the element:

```css
#glift-display-div {
  min-height:500px;
  min-width:400px;
}
```

If it's necessary, you can also specify the `minHeight` and `minWidth`
parameters in the options:

```javascript
glift.create({
  divId: 'foo-div',
  sgf: 'my/url/commentary.sgf',
  display: {
    minHeight: '500px',
    minWidth: '400px',
  }
});
