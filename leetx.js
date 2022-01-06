const axios = require('axios');

const search_url = '';

async function search(term){
  console.log(term);

  try{
    const result = await axios.get('https://1337x.wtf/search/'+term+'/1/')
    const lines = result.data.split(/\r?\n/)

    const search_results = []

    var num = 0

    lines.map((l,line_number)=>{
      if(l.includes('/torrent/')){
        result_object = {}
        result_object.num = num
        search_line = l.split('</a>')[1]
        result_object.search_line = search_line
        search_line_title = search_line.split('/')[3]
        result_object.name = search_line_title
        result_object.seeds = (lines[line_number+1].split('>')[1].split('<')[0])
        result_object.leeches = (lines[line_number+2].split('>')[1].split('<')[0])
        result_object.size = (lines[line_number+4].split('>')[1].split('<')[0])
        search_results.push(result_object)
        if(search_line_title.includes('720p')){
          result_object.resolution = '720p'
        }
        else if(search_line_title.includes('1080p')){
          result_object.resolution = '1080p'
        }
        else if(search_line_title.includes('2160p')){
          result_object.resolution = '2160p'
        }
        else {
          result_object.resolution = '?'
        }
        num++
      }
    })

    return search_results.slice(0,10)
  } catch {
    console.log('SOMETHING BAD HAPPENED')
    return []
  }
}

async function get_magnet(line){
  try{
    const magnet_page_link = "https://1337x.wtf"+line.split('"')[1]

    const magnet_page = await axios.get(magnet_page_link)
    const magnet_page_html = magnet_page.data
    const magnet_page_html_split = magnet_page_html.split(/\r?\n/)

    let magnet_line

    magnet_page_html_split.map((line,i)=>{
      if(line.includes('magnet:')){
        if(magnet_line == null){
          magnet_line = line
        }
      }
    })

    magnet_link = (magnet_line.split('"')[3])
    return(magnet_link)
  } catch(error){
    console.log(error)
    return(null)
  }
}

module.exports.search = search;
module.exports.get_magnet = get_magnet;
