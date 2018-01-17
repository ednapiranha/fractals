(function () {
  var container = document.querySelector('body')
  var count = 0
  var renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)

  var opacity = 0.9
  var scene = new THREE.Scene()
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000 )
  camera.position.x = 300
  camera.position.z = 300

  var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1)
  scene.add(light)

  var orbit = new THREE.OrbitControls(camera, renderer.domElement)
  orbit.enableZoom = true
  orbit.autoRotate = true
  orbit.autoRotateSpeed = 10.0

  var green = 0
  var blue = 0
  var angle = 0
  var rSplit
  var tri = 'F-G-G'
  var countR = 0
  var turn = ''
  var incr = 1
  var color = 'rgb(55, 255, 255)'

  function collect() {
    var newTri = ''

    if (count < 8) {
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

  var rules = {
    F: 'F-G+F+G-F',
    G: 'GG'
  }

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

    rSplit = tri.split('')
  }

  var offsetY = -150
  var tx = 0
  var ty = 0 + offsetY
  var tz = 0
  var axisZ = new THREE.Vector3(0, 0, 1)

  var startpoint = new THREE.Vector3(tx, ty, tz)
  var endpoint = new THREE.Vector3()
  var vector_delta = new THREE.Vector3(incr, incr, 0)

  function plot(t) {

    switch (t) {
      case 'F':
      case 'G':
        blue += 10
        green += 1

        if (blue > 255) {
          blue = 0
        }

        if (green > 205) {
          green = 0
        }

        tx += incr
        ty += incr

        var a = vector_delta.clone().applyAxisAngle(axisZ, angle * (Math.PI / 180))

        endpoint.addVectors(startpoint, a)

        var geometry = new THREE.Geometry()
        geometry.vertices.push(startpoint.clone())
        geometry.vertices.push(endpoint.clone())

        var line = new MeshLine()
        line.setGeometry(geometry, function () {
          return 1
        })

        var material = new MeshLineMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0.5
        })

        var mesh = new THREE.Mesh(line.geometry, material)
        scene.add(mesh)

        startpoint.copy(endpoint)

        tx = 0
        ty = 0

        turn = ''
        break
      case '-':
        color = 'rgb(10, 180, ' + blue + ')'
        turn = 'right'
        angle -= 120
        break
      case '+':
        color = 'rgb(225, '+ green +', ' + blue + ')'
        turn = 'left'
        angle += 120
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