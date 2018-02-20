const React = require("react");
const ReactDOM = require("react-dom");
const PropTypes = require("prop-types");
const { styled } = require("styletron-react");
const xray = require("xray");
const TextPlane = require("./text_plane");
const $ = React.createElement;

class TextEditorContainer extends React.Component {
  constructor(props) {
    super(props);

    const buffer = new xray.TextBuffer(1);
    const editor = new xray.TextEditor(buffer, this.editorChanged.bind(this));

    if (props.initialText) {
      buffer.splice(0, 0, props.initialText);
    }

    this.state = {
      editor: editor,
      scrollTop: 0,
      offsetHeight: 0,
      offsetWidth: 0,
      editorVersion: 0
    };
  }

  componentDidMount() {
    const { offsetWidth, offsetHeight } = ReactDOM.findDOMNode(this);

    this.setState({
      offsetWidth,
      offsetHeight
    });
  }

  componentWillUnmount() {
    this.state.editor.destroy();
  }

  editorChanged() {
    this.setState({
      editorVersion: this.state.editorVersion + 1
    });
  }

  computeFrameState() {
    const { scrollTop, offsetHeight } = this.state;
    const { fontSize, lineHeight } = this.context.theme.editor;
    return this.state.editor.render({
      scrollTop,
      offsetHeight,
      lineHeight: fontSize * lineHeight
    });
  }

  render() {
    const { offsetWidth, offsetHeight } = this.state;

    return $(TextEditor, {
      offsetWidth,
      offsetHeight,
      frameState: this.computeFrameState(),
      onWheel: (event) => {
        this.setState({scrollTop: Math.max(0, this.state.scrollTop + event.deltaY)})
      }
    });
  }
}

TextEditorContainer.contextTypes = {
  theme: PropTypes.object
};

const Root = styled("div", {
  width: "100%",
  height: "100%",
  overflow: "hidden"
});

function TextEditor(props) {
  return $(
    Root,
    {onWheel: props.onWheel},
    $(TextPlane, {
      width: props.offsetWidth,
      height: props.offsetHeight,
      frameState: props.frameState
    })
  );
}

module.exports = TextEditorContainer;
