import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Budget from '../abis/budget.json'
import styled from 'styled-components';
import Header from './Header';

const axios = require('axios').default;
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    await this.budget()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Budget.networks[networkId]
    if(networkData) {
      const contract = web3.eth.Contract(Budget.abi, networkData.address)
      this.setState({ contract })
      const budgetHash = await contract.methods.get().call({from: accounts[0]})
      this.setState({ budgetHash })

    } else {
        window.alert('Smart contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      budgetHash: '',
      contract: null,
      web3: null,
      buffer: null,
      account: null,
      budget: null
    }
  }

  captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  onSubmit = (event) => {
    event.preventDefault()
    console.log("Submitting file to ipfs...")
    ipfs.add(this.state.buffer, (error, result) => {
      this.setState({ budgetHash: result[0].hash })
      if(error) {
        console.error(error)
        return
      }
       this.state.contract.methods.set(this.state.account, result[0].hash).send({from: this.state.account}).then((r) => {
         return 
       }).catch(console.log)
    })
  }

  async budget() {
    if(this.state.budgetHash !== "") {
      const budgetData = await axios.get(`https://ipfs.infura.io/ipfs/${this.state.budgetHash}`)
      this.setState({budget: budgetData.data})
    }
  }

  render() {

    const Wrapper = styled.div`
      color: white;
      height: 100%;
      font-size: 18px;
      font-weight: 500;
    `

    return (
      <Wrapper>
        <Header />
        <div className="container-fluid mt-5">
          <div  >
            <main style={{ display: 'flex', justifyContent: 'center'}}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '24px' }}>
                <p>&nbsp;</p>
                <h2>Upload Budget</h2>
                <div>{this.state.account || 'Install MetaMask'}</div>
                <form onSubmit={this.onSubmit} >
                  <input type='file' onChange={this.captureFile} />
                  <input type='submit' />
                </form>
                { this.state.budget && 
                    <>
                      <div style={{ textAlign: 'center' }}>Budget</div>
                        <div style={{ textAlign: 'left' }}>
                        <div>Name Of Media: {this.state.budget.nameOfMedia}</div>
                        <div>Amount: {this.state.budget.amount}</div>
                        <div>Currency: {this.state.budget.currency}</div>
                        <div>Vendor: {this.state.budget.vendor}</div>
                        <div>Genre: {this.state.budget.genre}</div>
                        <div>Date: {this.state.budget.date}</div>
                      </div>
                    </>

                }
              </div>
            </main>
          </div>
        </div>
      </Wrapper>
    );
  }
}

export default App;
