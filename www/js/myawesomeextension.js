// *******************************************
// My Awesome Extension
// *******************************************

function MyAwesomeExtension(viewer, options) {
  Autodesk.Viewing.Extension.call(this, viewer, options);
}

MyAwesomeExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
MyAwesomeExtension.prototype.constructor = MyAwesomeExtension;

MyAwesomeExtension.prototype.load = function () {
  if (this.viewer.toolbar) {
    // Toolbar is already available, create the UI
    this.createUI();
  } else {
    // Toolbar hasn't been created yet, wait until we get notification of its creation
    this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
    this.viewer.addEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
  }
  return true;
};

MyAwesomeExtension.prototype.onToolbarCreated = function () {
  this.viewer.removeEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
  this.onToolbarCreatedBinded = null;
  this.createUI();
};

MyAwesomeExtension.prototype.createUI = function () {
  var _this = this;

  // prepare to execute the button action
  var myAwesomeToolbarButton = new Autodesk.Viewing.UI.Button('runMyAwesomeCode');
  myAwesomeToolbarButton.onClick = function (e) {


		console.log(_this.viewer);
		
		var particle_size = 0.03; // 0.01 for github Dambreak | 0.005 for gearbox | 0.1 for fluid | propeller = 0.01
		var colormap_min = -1;  // min for Lookup Table [m/s]
		var colormap_max = 1;   // max for Lookup Table [m/s]
		// var filename = 'gearbox/gearbox_460.csv'       //  github datastorage
		var filename = 'propeller/propeller_400.csv'   //  github data storage
		// var filename = 'fluid.csv'					   //  amazon S3 (don't use for testing) 
		var data;
		var rawFile = new XMLHttpRequest();
		rawFile.open("GET", 'https://raw.githubusercontent.com/jobi2122/datastorage/master/propeller/propeller_reduced.csv', true);
		rawFile.onreadystatechange = function () {
			if(rawFile.readyState === 4) {
				if(rawFile.status === 200 || rawFile.status == 0) {
					data = rawFile.responseText;
					alert(data);
					console.log('data')
					console.log(data)
			pointGeometry = new THREE.Geometry();
		  var positions = [];
			var velocities = [];
			var attributes;
			var particles = data.split(/\n/g);
			for ( var i = 0; i < particles.length; i++) {
				attributes = particles[i].split(",");
				velocities.push(new THREE.Vector3(
					parseFloat(attributes[0]), 
					parseFloat(attributes[1]), 
					parseFloat(attributes[2]))
				);
            	positions.push(new THREE.Vector3( 
            		parseFloat(attributes[3]), 
            		parseFloat(attributes[4]),
            		parseFloat(attributes[5]))
				);
			};
    		pointGeometry.vertices = positions;
			// console.log(positions);
			// console.log(velocities);
			var positions = new Float32Array( pointGeometry.vertices.length * 3 );
			var colors = new Float32Array( pointGeometry.vertices.length * 3 );
			var sizes = new Float32Array( pointGeometry.vertices.length );
			var vertex;
			var color = new THREE.Color();

			// var lut = new THREE.Lut("rainbow", 255);
			// lut.setMax(colormap_max);
			// lut.setMin(colormap_min);
			
			for ( var i = 0; i < pointGeometry.vertices.length; i ++ ) {
				vertex = pointGeometry.vertices[ i ];
				vertex.toArray( positions, i * 3 );
				// color.setHSL( 0.6, 1, velocities[10].x / 2.8 );
				// color = lut.getColor(velocities[i].x);
				color.setHSL( 0.6, 1, velocities[i].x / 2.8 );
				color.toArray( colors, i * 3 );
    	    }
			var geometry = new THREE.BufferGeometry();
			geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
			geometry.addAttribute( 'ca', new THREE.BufferAttribute( colors, 3 ) );
			geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
			for  (var i = 0; i < geometry.attributes.size.array.length; i++){
				geometry.attributes.size.array[i] = particle_size;  // particle size
			}
			var texture = new THREE.TextureLoader().load("https://raw.githubusercontent.com/mrdoob/three.js/feefe06713cd6b44baaf5de8e58234a100275c8d/examples/textures/sprites/ball.png" );
			// texture.wrapS = THREE.RepeatWrapping;
			// texture.wrapT = THREE.RepeatWrapping;
			var material = new THREE.ShaderMaterial( {
				uniforms: {
					amplitude: { value: 1 },
					color:     { value: new THREE.Color( 0xffffff ) },
					texture:   { value: texture }
				},
				vertexShader:   document.getElementById( 'vertexshader' ).textContent,
				fragmentShader: document.getElementById( 'fragmentshader' ).textContent
			});
			var geometry_nobuffer = new THREE.Geometry().fromBufferGeometry( geometry );

			object = new THREE.PointCloud( geometry_nobuffer, material );
      
      _this.viewer.impl.scene.add(object);
      _this.viewer.impl.invalidate(true);
	}
}
}
rawFile.send(null);

    //add two spheres to scene
    // _this.viewer.impl.scene.add(plane);
    // // _this.viewer.impl.scene.add(sphere_minpt);

    // _this.viewer.impl.invalidate(true);

    alert('I am an extension');
  };
  // myAwesomeToolbarButton CSS class should be defined on your .css file
  // you may include icons, below is a sample class:
  myAwesomeToolbarButton.addClass('myAwesomeToolbarButton');
  myAwesomeToolbarButton.setToolTip('My Awesome extension');

  // SubToolbar
  this.subToolbar = (this.viewer.toolbar.getControl("MyAppToolbar") ?
    this.viewer.toolbar.getControl("MyAppToolbar") :
    new Autodesk.Viewing.UI.ControlGroup('MyAppToolbar'));
  this.subToolbar.addControl(myAwesomeToolbarButton);

  this.viewer.toolbar.addControl(this.subToolbar);
};

MyAwesomeExtension.prototype.unload = function () {
  this.viewer.toolbar.removeControl(this.subToolbar);
  return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension('MyAwesomeExtension', MyAwesomeExtension);