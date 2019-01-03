function loadText(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.overrideMimeType("text/plain");
    xhr.send(null);
    if(xhr.status === 200)
        return xhr.responseText;
    else {
        return null;
    }
}

/*
    Init canvas
*/
var canvas;
var gl;
var program;

/*
    Init attrib
*/
var attribPos; 
var attribColor;
var perspective;
var translation;
var uniformRotationMat; 
var uniformScaleMat;

/* 
    Init pos cube
*/
var altCubeColor;
var buffers = [];
var cubeColor;
var rotationVal = {x: 0, y: 0, z: 0};
var translationVal = {x: 0, y: 0, z: 0};
var vertexColors = [];
var vertexPositions = [];
var yFov = 80;
var zoom = 1.0;



/*
    Init inputs and actions values
*/
var mousePressed = false;
var xTranslaInp;
var yTranslaInp;
var zTranslaInp;
var xRotInp;
var yRotInp;
var zRotInp;
var yFovInput;
var zoomInput;

function initContext() {
    canvas = document.getElementById('dawin-webgl');
    gl = canvas.getContext('webgl');
    if (!gl) {
        console.error('ERREUR : Échec du chargement du contenu');
        return;
    }
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
}

function initShaders() {
    var vertexShaderSource = loadText("canvas/glsl/vertex.glsl");
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    var fragmentShaderSource = loadText("canvas/glsl/fragment.glsl");
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader));
    }
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(fragmentShader));
    }
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);
}

function setCanvasResolution() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function initAttributes() {
    attribPos = gl.getAttribLocation(program, "position");
    attribColor = gl.getAttribLocation(program, "vertexColor");
    perspective = gl.getUniformLocation(program, "perspective");
    translation = gl.getUniformLocation(program, "translation");
    uniformRotationMat = gl.getUniformLocation(program, "rotation");
    uniformScaleMat = gl.getUniformLocation(program, "scale");
}

function initBuffers() {
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribColor);
    buffers["color"] = colorBuffer;
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribPos);
    buffers["pos"] = positionBuffer;
}

function initInputs() {
    xTranslaInp = document.getElementById('xTranslaInp');
    xTranslaInp.addEventListener('input', function () {
        translationVal.x = this.value;
    });

    yTranslaInp = document.getElementById('yTranslaInp');
    yTranslaInp.addEventListener('input', function () {
        translationVal.y = this.value;
    });

    zTranslaInp = document.getElementById('zTranslaInp');
    zTranslaInp.addEventListener('input', function () {
        translationVal.z = this.value;
    });

    xRotInp = document.getElementById('xRotInp');
    xRotInp.addEventListener('input', function () {
        rotationVal.x = this.value;
    });

    yRotInp = document.getElementById('yRotInp');
    yRotInp.addEventListener('input', function () {
        rotationVal.y = this.value;
    });

    zRotInp = document.getElementById('zRotInp');
    zRotInp.addEventListener('input', function () {
        rotationVal.z = this.value;
    });

    zoomInput = document.getElementById('zoomInput');
    zoomInput.addEventListener('input', function () {
        zoom = this.value;
    });

    yFovInput = document.getElementById('yFovInput');
    yFovInput.addEventListener('input', function () {
        yFov = this.value;
        initPerspective();
    });

}

function initPerspective() {
    setCanvasResolution();
    var perspectiveMat = mat4.create();
    var fieldOfView = yFov * Math.PI / 180;
    var aspect = canvas.clientWidth / canvas.clientHeight;
    mat4.perspective(perspectiveMat, fieldOfView, aspect, 0.1, 100.0);
    gl.uniformMatrix4fv(perspective, false, perspectiveMat);
}

function initCube() {
    vertexPositions = [ 
        -1.0, -1.0,  1.0, 1.0,  1.0,  1.0, 1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0, 1.0,  1.0,  1.0, -1.0,  1.0,  1.0,
        -1.0, -1.0, -1.0, 1.0,  1.0, -1.0, -1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0, 1.0,  1.0, -1.0, 1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0, 1.0,  1.0,  1.0, -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0, 1.0,  1.0,  1.0, 1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0, 1.0, -1.0,  1.0, 1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0, 1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
        1.0, -1.0, -1.0, 1.0,  1.0,  1.0, 1.0,  1.0, -1.0,
        1.0, -1.0, -1.0, 1.0,  1.0,  1.0, 1.0, -1.0,  1.0,
        -1.0, -1.0, -1.0, -1.0,  1.0,  1.0, -1.0, -1.0,  1.0,
        -1.0, -1.0, -1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0
    ];

    vertexColors = [
        Array(6).fill([1.0, 0.0, 0.0]).flat(),
        Array(6).fill([0.0, 1.0, 0.0]).flat(),
        Array(6).fill([0.0, 0.0, 1.0]).flat(),
        Array(6).fill([1.0, 1.0, 0.0]).flat(),
        Array(6).fill([0.0, 1.0, 1.0]).flat(),
        Array(6).fill([1.0, 0.0, 1.0]).flat(),
    ].flat();
}

function initMouseEvents() {
    canvas.addEventListener('wheel', function (e) {
        e.preventDefault();
        if(e.deltaY > 0){
            zoom = Math.min(zoom + 0.04, 5)
        } else {
            zoom = Math.max(zoom - 0.04, 0.2);
        }
        zoomInput.value = zoom;
    });

    canvas.addEventListener('mouseup', function () {
        mousePressed = false;
    });

    canvas.addEventListener('mouseleave', function () {
        mousePressed = false;
    });

    canvas.addEventListener('mousedown', function () {
        mousePressed = true;
    });

    canvas.addEventListener('mousemove', function (e) {
        if (!mousePressed) {
            return;
        } else {
            rotationVal.x -= (event.movementY / 100);
            rotationVal.x = rotationVal.x - 2 * Math.PI * Math.floor((rotationVal.x + Math.PI) / (2 * Math.PI))
            xRotInp.value = rotationVal.x;
            rotationVal.y -= (event.movementX / 100);
            rotationVal.y = rotationVal.y - 2 * Math.PI * Math.floor((rotationVal.y + Math.PI) / (2 * Math.PI))
            yRotInp.value = rotationVal.y;
        }
        
    });
}

function refreshTransformation() {
    var rotationMat = mat4.create();
    mat4.rotateX(rotationMat, rotationMat, -rotationVal.x);
    mat4.rotateY(rotationMat, rotationMat, -rotationVal.y);
    mat4.rotateZ(rotationMat, rotationMat, -rotationVal.z);
    gl.uniformMatrix4fv(uniformRotationMat, false, rotationMat);
    var translationMat = mat4.create();
    var translationVec = vec3.fromValues(translationVal.x, translationVal.y, translationVal.z - 5);
    mat4.fromTranslation(translationMat, translationVec);
    gl.uniformMatrix4fv(translation, false, translationMat);
    var scaleMat = mat4.create();
    var scaleVec = vec3.fromValues(zoom, zoom, zoom, 1);
    mat4.fromScaling(scaleMat, scaleVec);
    gl.uniformMatrix4fv(uniformScaleMat, false, scaleMat);
}

function draw() {
    refreshTransformation();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertexPositions.length / 3);
    requestAnimationFrame(draw);
}

function main() {
    initContext();
    initShaders();
    initAttributes();
    initPerspective();
    initCube();
    initBuffers();
    initInputs();
    initMouseEvents();
    draw();
    window.addEventListener('resize', function() {
        initPerspective();
    });
}