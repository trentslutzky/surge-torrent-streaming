import {useState, useEffect} from 'react';
import styled from 'styled-components';
import {theme} from './theme';

import {
  Box, 
  Grommet,
  Heading,
  TextInput,
  Keyboard,
  Spinner,
  Text,
  DataTable,
} from 'grommet';

// electron stuff
const {shell, ipcRenderer} = window.require('electron');

const { exec,spawn } = window.require('child_process');

const delay = ms => new Promise(res => setTimeout(res, ms));

export default function App() {

  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState(null);

  const [selected, setSelected] = useState(-1);

  const [showStream, setShowStream] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);

  const [magnet, setMagnet] = useState(null);
  const [streamLoadText, setStreamLoadText] = useState('Loading');
  //const [streamError, setStreamError] = useState('Error: no space left on device');

  function handleSearchTerm(e){
    setSelected(-1)
    setSearchTerm(e.target.value)
  }

  function handleGotMagnet(result){
      setMagnet(result)
  }

  useEffect(()=>{
    if(magnet != null){
      handleShowStream(magnet)
    }
  },[magnet])

  async function handleSelectStream(result){
    setShowStream(true)
    ipcRenderer.send('get_magnet',result.search_line)
  }

  function streamData(out_string){
    out_string = out_string.replace(/\[[1-9]m/g,'').replace(/\[[1-9][1-9]m/g,'')
    setStreamLoadText(out_string)
    if(out_string.includes('exiting')){
      setStreamLoading(false)
    }
    console.log(out_string)
  }

  async function handleShowStream(magnet_link){
    setStreamLoading(true)

    const stream_process = spawn('webtorrent', [magnet_link,'--mpv'])
    stream_process.stdout.setEncoding('utf8');

    await delay(100)

    stream_process.stdout.on('data',(data)=>{
      streamData(data.toString())
    })

    stream_process.on('close',()=>{
      setMagnet(null)
      setSearchResults(null)
      setSearchTerm('')
      setShowStream(false)
    })

  }

  function handleWindowInput(input){
    if(input.isAutoRepeat == false && input.type == "keyDown"){
      if(['Enter','ArrowUp','ArrowDown'].includes(input.key) != false){
        if(searchResults != null){
          if(input.key == 'ArrowUp' && selected > 0){
            setSelected(selected - 1)
          }
          if(input.key == 'ArrowDown' && selected < searchResults.length){
            setSelected(selected + 1)
          }
          if(input.key == 'Enter' && selected > -1 && selected < searchResults.length){
            setMagnet(null)
            handleSelectStream(searchResults[selected])
          }
        }
      }
    }
  }

  function doInput(input){
    setInput(input)
  }

  useEffect(()=>{
    if(input != null){
      handleWindowInput(input)
    }
  },[input])

  useEffect(()=>{
    if(ready == false){
      console.log('IPC')
      ipcRenderer.on(('search_results'),function(event,val){
        setSearchResults(val)
        setSearching(false)
      })
      ipcRenderer.on(('window_input'),(event,input)=>{
        doInput(input)
      })
      ipcRenderer.on(('got_magnet'),(event,result)=>{
        handleGotMagnet(result)
      })
      if(searchResults != null){
        setReady(true)
      }
    }
  },[searchResults,ready])

  async function handleSubmit(e){
    e.preventDefault()
    setSelected(0)
    setReady(false)
    setSearchResults(null)
    console.log(searchTerm)
    setSearching(true)
    ipcRenderer.send('search',searchTerm)
  }

  if(showStream){
    return(
      <BigGrommet theme={theme}>
        <Box 
          height="100%"
          width="100%"
          background="black"
          animation="fadeIn"
          direction="column"
          align="center"
        >
          {streamLoading&&
          <Box margin={{top:'10vh'}} align="center" animation="fadeIn">
            <Title>loading stream</Title>
            <Spinner margin="10vh" size="0.5vh"/>
          </Box>
          }
          <Box fill direction="row" align="center">
            <Box direction="column" align="center" width="100%">
              <MonoText size="2vh" textAlign="center" fill color="#123456">
                {streamLoadText}
              </MonoText>
              <Box height="15vh"/>
            </Box>
          </Box>
        </Box>
      </BigGrommet>
    )
  }

  return (
    <BigGrommet theme={theme}>
      <Box height="100%" 
        width="100%" 
        direction="column" 
        align="center"
        pad={{top:"large"}}
        animation={{
          type:"fadeIn",
          duration:2000,
        }}
      >
        <Box width="100%" direction="column" align="center">
          <Title size="10vh" color="#123456" margin="none"
          >
            surge
          </Title>
          <Text margin="none" size="2vh">
            Search for a movie or show
          </Text>
          <Text margin="none" size="1vh">
            [Up/Down] to navigate [Enter] to select
          </Text>
          <Box width="60vh" margin={{vertical:"2vh"}}>
            <form onSubmit={handleSubmit}>
              <TextInput
                size="2vh"
                value={searchTerm}
                onChange={handleSearchTerm}
                autoFocus
                disabled={searching}
              />
            </form>
          </Box>
          {searching==true&&
            <Box margin={{top:"10vh"}}>
              <Spinner size="1vh"/>
            </Box>
          }
          {searchResults &&
            <div>
            {searching==false&&searchResults.length > 0&&
              <Box margin={{top:"2vh"}} height="70vh">
                <SearchResults results={searchResults} selected={selected}/>
              </Box>
            }
            {searching==false&&searchResults.length == 0&&
              <Box margin={{top:"2vh"}} height="70vh">
                <Text
                  size="5vh"
                  color="#ffffff15"
                >
                  NO RESULTS
                </Text>
              </Box>
            }
            </div>
          }
        </Box>
      </Box>
    </BigGrommet>
  );
}

function SearchResults({results,selected}){
  if(results == null){
    return(<Text>none</Text>)
  }

  const animation_type = "fadeIn"
  const animation_delay = 100

  return(
    <TableBox>
        <DataTable
          fill
          step={1}
          pad="small"
          background={
            results.map((r)=>(
              r.num==selected?"#ffffff12":""
            ))
          }
          columns={
            [
              {
                property:'selected',
                size:"5vh",
                align:"center",
                render: data => (
                  <Box animation={{type:animation_type,delay:animation_delay*data.num}}>
                    <MonoText 
                      size="2vh"
                    >
                      {selected==data.num?"[#]":"[ ]"}
                    </MonoText>
                  </Box>
                ),
              },
              {
                property:'seeds',
                header:<Text size="1.5vh">Seed</Text>,
                size:"5vh",
                align:"center",
                render: data => (
                  <Box animation={{type:animation_type,delay:animation_delay*data.num}}>
                    <MonoText 
                      color="green"
                      size="1.5vh"
                    >
                      {data.seeds}
                    </MonoText>
                  </Box>
                ),
              },
              {
                property:'leeches',
                header:<Text size="1.5vh">Leech</Text>,
                size:"5vh",
                align:"center",
                render: data => (
                  <Box animation={{type:animation_type,delay:animation_delay*data.num}}>
                    <MonoText
                      color="red"
                      size="1.5vh"
                    >
                      {data.leeches}
                    </MonoText>
                  </Box>
                ),
              },
              {
                property:'resolution',
                header:<Text size="1.5vh">Res.</Text>,
                render: data => (
                  <Box animation={{type:animation_type,delay:animation_delay*data.num}}>
                    <MonoText
                      size="1.5vh"
                    >
                      {data.resolution}
                    </MonoText>
                  </Box>
                ),
              },
              {
                property:'name',
                header:<Text size="1.5vh">Name</Text>,
                render: data => (
                  <Box animation={{type:animation_type,delay:animation_delay*data.num}}>
                    <MonoText
                      size="1.5vh"
                    >
                      {data.name.substring(0,60)}
                    </MonoText>
                  </Box>
                ),
              },
              {
                property:'size',
                header:<Text size="1.5vh">Size</Text>,
                render: data => (
                  <Box animation={{type:animation_type,delay:animation_delay*data.num}}>
                    <MonoText
                      size="1.5vh"
                    >
                      {data.size}
                    </MonoText>
                  </Box>
                ),
              },
            ]
          }
          data={results}
        />
    </TableBox>
  )
}

const BigGrommet = styled(Grommet)`
    height:100%;
`;

const MainHeading = styled(Heading)`
  line-height:10vh;
`;

const TableBox = styled(Box)`
  min-width:10vh;
  overflow:hidden;
  background:#00000088;
  padding:2vh;
`;

const Title = styled(Heading)`
  font-family: 'Roboto Mono', monospace;
`;

const MonoText = styled(Text)`
  font-family: 'Roboto Mono', monospace;
  overflow:visible;
`;

const IndicatorBox = styled(Box)`
  overflow:visible;
`;
