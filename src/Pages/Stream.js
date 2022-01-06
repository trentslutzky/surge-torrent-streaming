import {useState, useEffect} from 'react'
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

const test_magnet = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'


export default function Stream(){

  const WebTorrent = window.require('webtorrent')
  const client = new WebTorrent()

  const [torrentFiles, setTorrentFiles] = useState([])

  async function get_stream(){
    client.on('error', err => {
      console.log('[+] Webtorrent error: ' + err.message);
    });

    client.add(test_magnet, (torrent) => {
      const interval = setInterval(() => {
        console.log('[+] Progress: ' + (torrent.progress * 100).toFixed(1) + '%')
        //this.setState({torrentProgress: (torrent.progress * 100).toFixed(1) + '%'});
      }, 5000);

      torrent.on('done', () => {
        console.log('Progress: 100%');
        clearInterval(interval);
      })

      setTorrentFiles(torrent.files)
    });
  }

  useEffect(()=>{
    console.log('torrent files changed')
    console.log(torrentFiles)
    // TODO Figure out a better way to render these files 
    torrentFiles.map((file, i) => {
      if(file.name.includes('.mpy')){
        console.log(file.name)
        file.appendTo('body');
      }
    })
  },[torrentFiles])

  useEffect(()=>{
    console.log('ONCE')
    get_stream()
  },[])

  return(
    <Box>
      <Text>test</Text>
      <div className="player"></div>
    </Box>
  )

}
