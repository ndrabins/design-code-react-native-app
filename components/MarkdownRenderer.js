import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, Text, WebView, StyleSheet, Linking } from "react-native";
import showdown from "showdown";

class MarkdownRenderer extends Component {
  static defaultShowdownOptions = {
    simplifiedAutoLink: true,
    strikethrough: true,
    tables: true,
  };

  state = { html: null, contentHeight: 1 };
  converter = null;

  componentWillMount() {
    this._instantiateShowdownConverter(this.props.options);
    this._convertMarkdown(this.props.body);
  }

  componentWillReceiveProps(nextProps) {
    this.props.options !== nextProps.options &&
      this._instantiateShowdownConverter(nextProps.options);
    this.props.body !== nextProps.body && this._convertMarkdown(nextProps.body);
  }

  _instantiateShowdownConverter(options) {
    this.converter = new showdown.Converter({
      ...this.constructor.defaultShowdownOptions,
      ...options,
    });
  }

  _convertMarkdown(markdownString) {
    this.setState({ html: this.converter.makeHtml(markdownString) });
  }

  render() {
    const { pureCSS, automaticallyAdjustContentInsets, style } = this.props;

    return (
      <WebView
        ref={"WebView"}
        source={{
          html: defaultHTML
            .replace("$title", "")
            .replace("$body", this.state.html)
            .replace("$pureCSS", pureCSS),
          baseUrl: "about:blank",
        }}
        injectedJavaScript={
          "setTimeout(function() { window.postMessage(document.body.scrollHeight, '*'); }, 1000);"
        }
        onMessage={event => {
          console.log("height", parseInt(event.nativeEvent.data));
          this.setState({ contentHeight: parseInt(event.nativeEvent.data) });
        }}
        automaticallyAdjustContentInsets={automaticallyAdjustContentInsets}
        onNavigationStateChange={this.onNavigationStateChange.bind(this)}
        style={{ flex: 1, height: this.state.contentHeight }}
      />
    );
  }

  onNavigationStateChange(navState) {
    if (navState.url !== "about:blank") {
      this.refs.WebView.stopLoading();
      Linking.openURL(navState.url);
    }
  }
}

export default MarkdownRenderer;

// const stylesheetProp = PropTypes.oneOfType([
// 	PropTypes.number,
// 	PropTypes.object,
// ]);

// MarkdownRenderer.propTypes = {
// 	title: PropTypes.string,
// 	body: PropTypes.string.isRequired,
// 	pureCSS: PropTypes.string,
// 	options: PropTypes.object,
// 	automaticallyAdjustContentInsets: PropTypes.bool,
// 	style: stylesheetProp,
// };

MarkdownRenderer.defaultProps = {
  title: "",
  pureCSS: "",
  options: {},
  style: {
    flex: 1,
  },
};

const defaultHTML = `<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="initial-scale=1, maximum-scale=1">
        <meta name="format-detection" content="telephone=no">
        <meta name="format-detection" content="date=no">
        <meta name="format-detection" content="address=no">
        <meta name="format-detection" content="email=no">
        <title>$title</title>
        <style type="text/css">
            body {
                font-family: Roboto, '-apple-system', Helvetica Neue, Arial;
            }
            b, strong {
                font-family: Roboto, '-apple-system', Helvetica Neue, Arial;
                font-weight: bold;
            }
            h1, h2, h3, h4, h5, h6 {
                font-family: Roboto, '-apple-system', Helvetica Neue, Arial;
                font-weight: bold;
            }
            $pureCSS
        </style>
    </head>
    <body>
        $body
    </body>
</html>`;
