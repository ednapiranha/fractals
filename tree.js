(function () {
  var container = document.querySelector('body')
  var count = 0
  var renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: false,
    alpha: true
  })
  renderer.setSize( 800, 800 )
  var opacity = 0.9
  var scene = new THREE.Scene()
  var camera = new THREE.PerspectiveCamera(95, window.innerWidth / window.innerHeight, 1, 1000 )
  camera.position.x = 300
  camera.position.z = 0

  var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1)
  scene.add(light)

  var directionalLight = new THREE.DirectionalLight( 0xffffff )
  directionalLight.position.set(0, 0.5, -0.5)
  directionalLight.position.normalize()
  scene.add( directionalLight )

  var orbit = new THREE.OrbitControls(camera, renderer.domElement)
  orbit.enableZoom = true
  orbit.autoRotate = true

  function collect() {
    var newTri = ''

    if (count < 10) {
      var triSplit = tri.split('')

      triSplit.map(function (t) {
        if (rules.hasOwnProperty(t)) {
          newTri += rules[t]
        } else {
          newTri += t
        }
      })

      tri = newTri
      count++
      collect()
    } else {
      return
    }
  }

  var rSplit

  var tri = 'X'
  var countR = 0
  var turn = ''
  var incr = 5
  var color = 'rgb(55, 255, 255)'

  var rules = {
    X: 'F[-X][X]F[-X]+FX',
    Y: 'FX-Y'
  }

  var blue = 0
  var angle = 0
  var offsetY = -150
  var tx = 0
  var ty = 0 + offsetY
  var tz = 0

  var stackA = []
  var stackV = []
  var stackAxis = []

  function init() {
    renderer.autoClearColor = false
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0xffffff, 0)
    //renderer.vr.enabled = true
    container.appendChild(renderer.domElement)

    scene.add(camera)
    scene.add(light)

    collect()
    console.log(tri)
    rSplit = tri.split('')
  }

  var x0 = tx
  var y0 = ty
  var z0 = tz
  var rota = 0
  var deltarota = 25 * Math.PI/180

  var axisY = new THREE.Vector3(0, 1, 0)

  var zero = new THREE.Vector3(0, 0, 0)
  var axis_delta = new THREE.Vector3()
  var prev_startpoint = new THREE.Vector3()

  var startpoint = new THREE.Vector3(x0,y0,z0)
  var endpoint = new THREE.Vector3()
  var bush_mark
  var vector_delta = new THREE.Vector3(incr, incr, 0)

  function plot(t) {
    switch (t) {
      case 'F':
        blue += 10
        var a

        if (turn) {
          a = vector_delta.clone().applyAxisAngle(axisY, Math.random() * rota)
          incr += 0.1
        } else {
          a = vector_delta.clone().applyAxisAngle(zero, rota)
        }

        endpoint.addVectors(startpoint, a)

        tx += endpoint.x + incr
        ty += endpoint.y + incr

        x0 = tx
        y0 = ty
        z0 = tz

        var geometry = new THREE.Geometry()

        geometry.vertices.push(startpoint.clone())
        geometry.vertices.push(endpoint.clone())

        prev_startpoint.copy(startpoint)
        axis_delta = new THREE.Vector3().copy(a).normalize()
        rota += deltarota

        var line = new MeshLine()
        line.setGeometry(geometry, function () {
          return 1
        })

        var material = new MeshLineMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0.6
        })

        var mesh = new THREE.Mesh(line.geometry, material)
        scene.add(mesh)

        turn = ''
        break
      case '-':
        color = 'rgb(10, 180, 255)'
        turn = 'right'
        angle += 35
        break
      case '+':
        color = 'rgb(205, 5, 255)'
        turn = 'left'
        angle -= 25
        break
      case '[':
        stackV.push(new THREE.Vector3(endpoint.x, endpoint.y, endpoint.z))
        stackA[stackA.length] = angle
        break
      case ']':
        var point = stackV.pop()
        startpoint.copy(new THREE.Vector3(point.x, point.y, point.z))
        angle = stackA.pop()
        break
    }
  }

  function render() {
    if (rSplit[countR]) {
      plot(rSplit[countR])
    }

    renderer.render(scene, camera)
    orbit.update()

    countR++

    window.requestAnimationFrame(render)
  }

  init()
  render()
})()