# Snakessss
Snakessss is a classic snake game that can be played up to 4 person simulatenously in real time.
The online demo can be found here: http://snakessss.herokuapp.com/
Github: https://github.com/nasyarobby/snakessss

## How to play
#####  Moving Your Snake
W / Arrow Up: move snake up
A / Arrow Left: move snake left
S / Arrow Down: move snake down
D / Arrow Right: move snake right

##### Eat the fruit
Move your snake to eat fruit (the red pixel) to score points

##### Race to 3 Points
Score 3 points to win the game

##### Dont hit your enemy or your own body!
You will lose point by doing so.



## Starting the Server
Basically, this project contains 2 apps, the backend that will serve the game, and the frontend (using React) that will serve the rooms list. The frontend's code is inside a subdirectory named _rooms_.
Step by step how to run the game.
1. Open the root directory in the terminal
2. run npm install
3. run node server.js
4. open another terminal
5. navigate to sub-directory rooms
6. run npm start
7. Open the browser (usually http://localhost:3000)

If you're attempting to deploy the game not in your local machine, make sure to change the variables 
publicServerAddress in rooms\src\index.js line 4
publicServerAddress in server.js line line 4
