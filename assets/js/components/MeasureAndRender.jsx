import React from "react";
import debounce from "debounce";

/**
 * HoC that Measures the element's bounding box and then renders children
 */
class MeasureAndRender extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      measurement: null,
      hasMeasured: false
    };
  }

  componentDidMount() {
    this.setState({
      measurement: this.el.getBoundingClientRect(),
      hasMeasured: true
    });
    window.addEventListener("resize", this.props.onWindowResize);
  }

  componentWillUnmount() {
    // stop listening to window resize
    window.removeEventListener("resize", this.props.onWindowResize);
  }

  render() {
    let style = {};
    if (this.props.stretch) {
      style.position = "absolute";
      style.top = 0;
      style.right = 0;
      style.bottom = 0;
      style.left = 0;
    }

    return (
      <div
        style={style}
        ref={node => {
          this.el = node;
        }}
      >
        {this.state.hasMeasured && this.props.children(this.state.measurement)}
      </div>
    );
  }
}

export default MeasureAndRender;
