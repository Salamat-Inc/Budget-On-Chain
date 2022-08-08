import React, { Component } from 'react';
import styled from 'styled-components';


class Header extends Component {

  render() {

    const Wrapper = styled.div`
      height: fit-content;
    `
    const Padding = styled.div`
        padding: 1em;
    `

    return (
      <Wrapper>
        <Padding>
            <img alt='logo' src='./images/logo.png'></img>
        </Padding>
      </Wrapper>
    );
  }
}

export default Header;
