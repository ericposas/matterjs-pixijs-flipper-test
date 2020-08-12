import Matter from 'matter-js'
import { degrees, radians } from 'radians'
import random from 'random'
import * as PIXI from 'pixi.js'
import './style.scss'
// import image assets
import board from './images/board.jpg'
import eyeball from './images/eyeball.png'
import concrete from './images/concrete.jpg'


window.start = () => {

	let app = new PIXI.Application({
		width: 700, height: 500
	})
	document.body.appendChild(app.view)

	const loader = new PIXI.Loader()
	loader
	.add('board', board)
	.add('eyeball', eyeball)
	.load((loader, resources) => {
		doPixiStuff()
		addPhysics()

	})

	let boardSprite
	let concreteFloor, concreteWall, concreteShelf
	function doPixiStuff() {
		let boardTex = new PIXI.Texture.from(board)
		boardSprite = new PIXI.Sprite(boardTex)
		app.stage.addChild(boardSprite)
		let concreteTex = new PIXI.Texture.from(concrete)
		concreteFloor = new PIXI.Sprite(concreteTex)
		concreteWall = new PIXI.Sprite(concreteTex)
		concreteShelf = new PIXI.Sprite(concreteTex)
		app.stage.addChild(concreteFloor)
		app.stage.addChild(concreteWall)
		app.stage.addChild(concreteShelf)

	}

  let Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  // MouseConstraint = Matter.MouseConstraint,
  // Mouse = Matter.Mouse,
  World = Matter.World,
	Constraint = Matter.Constraint,
  Bodies = Matter.Bodies,
	Body = Matter.Body;

	let engine
	let renderer
	let runner
	let world
	function addPhysics() {
		// create engine
		engine = Engine.create(),
		world = engine.world;
		// create renderer
		renderer = Render.create({
			element: document.body,
			engine: engine,
			options: {
				width: 700,
				height: 500,
				showVelocity: true
			}
		})
		// run physics
		Render.run(renderer)
	  // create runner
	  runner = Runner.create()
	  Runner.run(runner, engine)

	  // create bodies
		let floor = Bodies.rectangle(350, 500, 700, 100, { isStatic: true })
		let rightWall = Bodies.rectangle(700, 350, 100, 700, { isStatic: true })
		let stopper = Bodies.rectangle(300, 400, 100, 50, { isStatic: true })
		let shelf = Bodies.rectangle(600, 200, 100, 50, { isStatic: true })
		let flipper = Bodies.rectangle(150, 400, 200, 25, {})
		flipper.angle = .045
		let flipperConstraint = Constraint.create({
			label: 'flipper_ground_constraint',
			bodyA: flipper,
			pointA: { x: 100, y: 0 },
			bodyB: floor,
			pointB: { x: -100, y:-50 },
			length: 6,
		})
		// resize board according to flipper object
		boardSprite.width = 200
		boardSprite.height = 25
		boardSprite.anchor.set(.5, .5)
		// resize concrete walls/floors
		concreteWall.width = 50
		concreteWall.height = 500
		concreteWall['position']['x'] = 650
		concreteFloor.width = 700
		concreteFloor.height = 50
		concreteFloor.position.y = 450
		concreteShelf.width = 100
		concreteShelf.height = 50
		concreteShelf.position.x = 550
		concreteShelf.position.y = 175

		document.addEventListener('keydown', (e) => {
			if (e.keyCode === 32) {
				Body.applyForce(
					flipper,
					{ x: flipper.position.x - 50, y: flipper.position.y - 200 },
					{ x: .4, y: .3 }
				)
			}
		})

		// create new eyeball every n seconds
		let balls = [], eyeballs = []
		setInterval(() => {
			let r = random.int(15, 20)
			let ball = Bodies.circle(200, 100, r)
			ball.id = 'ball' + balls
			balls.push(ball)
			World.add(world, ball)
			// add eyeball texture for each ball physics object
			let eyeTex = new PIXI.Texture.from(eyeball)
			let eyeballSprite = new PIXI.Sprite(eyeTex)
			eyeballSprite.width = r * 3
			eyeballSprite.height = r * 3
			eyeballSprite.anchor.set(.5,.5)
			app.stage.addChild(eyeballSprite)
			eyeballs.push(eyeballSprite)
		}, 3000)

	  // add bodies
	  World.add(world, [
			floor, rightWall, flipper, flipperConstraint, //flipperBackSpring
			stopper, shelf
	  ])

	  // fit the render viewport to the scene
	  Render.lookAt(renderer, {
	    min: { x: 0, y: 0 },
	    max: { x: 700, y: 500 }
	  })

		let pixiCanvas = document.getElementsByTagName('canvas')[0]
		pixiCanvas.id = 'pixi'
		let matterCanvas = document.getElementsByTagName('canvas')[1]
		matterCanvas.id = 'matter'
		matterCanvas.style.opacity = 0

		function render() {

			let bodies = Matter.Composite.allBodies(engine.world)
			requestAnimationFrame(render)

			boardSprite.x = flipper.position.x
			boardSprite.y = flipper.position.y
			boardSprite.rotation = flipper.angle - .03

			for(let i = 0; i < eyeballs.length; i++) {
				eyeballs[i].x = balls[i].position.x
				eyeballs[i].y = balls[i].position.y
				eyeballs[i].rotation = balls[i].angle
			}

		}
		render()

	}
	

  // context for MatterTools.Demo
  return {
    engine: engine,
    runner: runner,
    render: renderer,
    canvas: renderer.canvas,
    stop: () => {
      Matter.Render.stop(renderer)
      Matter.Runner.stop(runner)
    }
  }

}
