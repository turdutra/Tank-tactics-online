const http = require('http');
const express = require('express');
const socketio = require('socket.io')
const fs = require('fs')
const ObjectsToCsv = require('objects-to-csv')


const app = express();
const clientPath = `${__dirname}/../client`;

class player {
  constructor(name, position, range, hp ,ap) {
    this.name=name
    this.position=position
    this.range=range
    this.hp=hp
    this.ap=ap
  }
  get array(){
    return([this.name,indexa(this.position),this.range,this.hp,this.ap])

  }
}
var players = []


var playersTxt = fs.readFileSync('gameState.csv', 'utf8')
var playersArray= txtToArray(playersTxt)



playersArray.forEach(p =>{
  players.push(new player(p[0],coord(p[1]),p[2],p[3],p[4]))
})

console.log(players)



console.log(`serving static from ${clientPath}`);

app.use(express.static(clientPath));

const server = http.createServer(app);
const io = socketio(server)


io.on('connection', (sock) => {

  sock.on('login', (credenciais) =>{
    sock.emit('players', [players,0])

  })

  console.log(players)
  var thisPlayer = 0

  sock.on('move', (index) => {

    if(players[thisPlayer].ap>0){

      if(distance(players[thisPlayer].position,coord(index))==1){

        if(getPlayer(index)=='nenhum'){

          players[thisPlayer].ap--
          players[thisPlayer].position=coord(index)
          updateTxt()
          io.emit('update', [players,0])
        }

        else{sock.emit('pop', 'Movimento inválido: espaço ocupado')}
      }

      else{sock.emit('pop', 'Movimento inválido: destino fora do alcance')}

    }
    else{sock.emit('pop', 'você está sem pontos de ação')}

  })

  sock.on('shoot', (index) => {
    if(players[thisPlayer].ap>0){

      if(distance(players[thisPlayer].position,coord(index)) < players[thisPlayer].range + 1 && distance(players[thisPlayer].position,coord(index)) > 0){

        if(getPlayer(index)!='nenhum'){

          players[thisPlayer].ap--
          players[getPlayer(index)].hp--
          players[thisPlayer].range=2
          updateTxt()
          io.emit('update', [players,0])
        }

        else{sock.emit('pop', 'Tiro inválido: nenhum alvo')}

      }

      else{sock.emit('pop', 'Tiro inválido: alvo fora do alcance')}

    }
    else{sock.emit('pop', 'você está sem pontos de ação')}

  })

  sock.on('give', (index) => {
    if(players[thisPlayer].ap>0){

      if(distance(players[thisPlayer].position,coord(index)) < players[thisPlayer].range + 1 && distance(players[thisPlayer].position,coord(index)) > 0){

        if(getPlayer(index)!='nenhum'){

          players[thisPlayer].ap--
          players[getPlayer(index)].ap++
          players[thisPlayer].range=2
          updateTxt()
          io.emit('update', [players,0])
        }

        else{sock.emit('pop', 'Doação inválido: nenhum alvo')}
      }

      else{sock.emit('pop', 'Doação inválido: alvo fora do alcance')}

    }
    else{sock.emit('pop', 'você está sem pontos de ação')}


  })

  sock.on('range', (index) => {
    if(players[thisPlayer].ap>0){

      players[thisPlayer].ap--
      players[thisPlayer].range++
      updateTxt()
      io.emit('update', [players,0])

    }
  })
})




server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(8080, () => {
  console.log('server started on 8080');
});


function getPlayer(index){
  var result = 'nenhum'
  players.forEach(p => {
    if (indexa(p.position)==index){
      result = players.indexOf(p)
    }

  })
  return result
}

function coord(index) {
    return [Math.floor(index/20),index%20]
  }
  function indexa(coord) {
    return coord[0]*20+coord[1]
  }
  function distance(s1,s2){
    return Math.max(Math.abs(s1[0]-s2[0]),Math.abs(s1[1]-s2[1]))
  }


function txtToArray(texto){
  var linhasTexto = (texto).split('\r\n')
  var tabela= []
  linhasTexto.forEach(line => {tabela.push(line.split(','))})
  tabela.pop()
  tabela.shift()

  tabela.forEach(i =>{
    i.forEach(j =>{
      if(!(Number.isNaN(Number(j)))){
        i[i.indexOf(j)]=Number(j)
      }
      else{}
    })
  })
  return tabela
}

async function updateTxt(){
  players.forEach(p =>{
    playersArray[players.indexOf(p)]=p.array
  })
  const csv = new ObjectsToCsv(playersArray)
  await csv.toDisk('./gameState.csv')
}
