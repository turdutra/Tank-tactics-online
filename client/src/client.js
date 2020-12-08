const squares = document.querySelectorAll('.grid div')
const butons = document.querySelectorAll('.butons div')


const onChatSubmitted = (e) => {
  e.preventDefault();

  const input = document.querySelector('#chat');
  const text = input.value;
  input.value = '';

  writeEvent(text);
};

function getInfo() {
var username = document.getElementById('username').value
var password = document.getElementById('password').value
console.log(password)

console.log("incorrect username or password")
}




class player {
  constructor(name, position, range, hp ,ap) {
    this.name=name
    this.position=position
    this.range=range
    this.hp=hp
    this.ap=ap
  }
}
var players = []


//var thisPlayer = new player('tur', [0,0],2,3, 10)





function coord(index) {
    return [Math.floor(index/20),index%20]
  }
  function indexa(coord) {
    return coord[0]*20+coord[1]
  }
  function distance(s1,s2){
    return Math.max(Math.abs(s1[0]-s2[0]),Math.abs(s1[1]-s2[1]))
  }









(() => {
  const sock = io();

  sock.on('players', (playersData) => gameState(playersData[0],playersData[1]))
  sock.on('pop',(msg) => alert(msg))
  sock.on('update', (playersData) => gameState(playersData[0],playersData[1]))

  //botões setup



  function clearBoard() {
    squares.forEach(square => {
      square.removeEventListener('click', moveOutcome)
      square.removeEventListener('click', shootOutcome)
      square.removeEventListener('click', giveOutcome)
      square.style.backgroundColor = 'white'
    })
  }

  //funçoes de clic

  function moveClick() {
    clearBoard()

    const squareArray = Array.from(squares)
    squares.forEach(square => {
      square.addEventListener('click', moveOutcome)
      if (distance(thisPlayer.position,coord(squareArray.indexOf(square)))==1){
        square.style.backgroundColor = 'green'
      }
    })
  }

  function rangeClick(){
    sock.emit('range')


  }


  function shootClick() {
    clearBoard()


    const squareArray = Array.from(squares)
    squares.forEach(square => {
      square.addEventListener('click', shootOutcome)
      if (distance(thisPlayer.position,coord(squareArray.indexOf(square)))<thisPlayer.range+1 && distance(thisPlayer.position,coord(squareArray.indexOf(square)))>0){
        square.style.backgroundColor = 'orange'
      }
    })
  }


  function giveClick() {
    clearBoard()


      const squareArray = Array.from(squares)
      squares.forEach(square => {
        square.addEventListener('click', giveOutcome)
        if (distance(thisPlayer.position,coord(squareArray.indexOf(square)))<thisPlayer.range+1 && distance(thisPlayer.position,coord(squareArray.indexOf(square)))>0){
          square.style.backgroundColor = 'pink'
        }
      })
    }


  //funções outcome


  function moveOutcome(e) {
    clearBoard()
    const squareArray = Array.from(squares)
    sock.emit('move', squareArray.indexOf(e.target))

  }

  function shootOutcome(e) {
    clearBoard()
    const squareArray = Array.from(squares)
    sock.emit('shoot', squareArray.indexOf(e.target))
  }

  function giveOutcome(e) {
    clearBoard()
    const squareArray = Array.from(squares)
    sock.emit('give', squareArray.indexOf(e.target))

  }

  function login(e) {
    console.log(e)
  }

  const loginForm = document.getElementById("login-form")
  const loginButton = document.getElementById("login-form-submit")
  loginButton.addEventListener("click", (e) => {
    // Prevent the default submission of the form
    e.preventDefault();
    // Get the values input by the user in the form fields
    const username = loginForm.username.value;
    const password = loginForm.password.value;

    sock.emit('login',[username,password])
  })


  function gameState(playersData, playerIndex){

    butons[0].addEventListener('click', moveClick)
    butons[1].addEventListener('click', rangeClick)
    butons[2].addEventListener('click', shootClick)
    butons[3].addEventListener('click', giveClick)


    squares.forEach(square => {
      square.classList.remove('player')
    })
    playersData.forEach(player => {
      squares[indexa(player.position)].classList.add('player')
    })

    thisPlayer=playersData[playerIndex]
    var txtScore= ''
    playersData.forEach(player => {
      txtScore=txtScore.concat('Nome: ',player.name,'  HP: ',player.hp,'  AP: ',player.ap,'\n')
    })
    document.getElementById('score').textContent = txtScore

  }

})();
