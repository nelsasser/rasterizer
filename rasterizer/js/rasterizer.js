/**
 *      BASIC POLYGON CREATION AND EDITING
 * 
 */
function Triangle(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
}

Triangle.prototype.setMatrices = function(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
}

Triangle.prototype.getMatrices = function() {
    return [this.a.matrix, this.b.matrix, this.c.matrix];
}

Triangle.getBoundingRect = function(a, b, c) {
    let minX = Math.min(a[0], Math.min(b[0], c[0]));
    let minY = Math.min(a[1], Math.min(b[1], c[1]));

    let maxX = Math.max(a[0], Math.max(b[0], c[0]));
    let maxY = Math.max(a[1], Math.max(b[1], c[1]));

    let width = maxX - minX;
    let height = maxY - minY;

    return new Rectangle(minX, minY, width, height);
}

Triangle.prototype.translate = function(transMat) {
    this.a.add1x4(transMat);
    this.b.add1x4(transMat);
    this.c.add1x4(transMat);
}

Triangle.prototype.rotate = function(axis, angles) {
    if(angles.length != axis.length) {
        return;
    }

    //create the matrices in the correct order with correct angles
    var mats = [];
    for(var i = 0; i < axis.length; i++) {
        if('x' == axis.substring(i, i+1)) {
            mats.push(Mat4x4.createRotationMatrix('x', angles[i]));
        } else if ('y' == axis.substring(i, i+1)) {
            mats.push(Mat4x4.createRotationMatrix('y', angles[i]));
        } else if ('z' == axis.substring(i, i+1)) {
            mats.push(Mat4x4.createRotationMatrix('z', angles[i]));
        }
    }

    //multiple them in order
    while(mats.length > 1) {
        //remove front two elements
        m1 = mats.shift();
        m2 = mats.shift();
        //multiply them
        nm = mult4x4by4x4(m1, m2);
        //put the product back in at the front
        mats.unshift(nm);
    }
    //multiply the each point by the final product
    this.a = mult1x4by4x4(this.a, mats[0]);
    this.b = mult1x4by4x4(this.b, mats[0]);
    this.c = mult1x4by4x4(this.c, mats[0]);
}

function Rectangle(x, y, width, height) {
    this.points = [Math.trunc(x), Math.trunc(y), Math.round(x + width), Math.round(y + height)];
}


/**
 *      BASIC MATRIX CREATION AND EDITING
 */
function Mat4x4(mat) {
    if(mat === undefined) {
        this.matrix = [
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0 ];
    } else {
        this.matrix = mat;
    }
    
}

Mat4x4.prototype.setValue = function(index, val) {
    this.matrix[index] = value;
}

Mat4x4.prototype.setMatrix = function(mat) {
    this.matrix = mat;
}

Mat4x4.createProjectionMatrix = function(type, near, far, fov) {
    let S = 1 / (Math.tan(fov / 2) * (Math.PI / 180));

    let mat = [
        S, 0, 0, 0,
        0, S, 0, 0,
        0, 0, -far/(far - near), -1,
        0, 0, -(far * near) / (far - near), 0
    ];

    let r = new Mat4x4(mat);
    return r;
}

Mat4x4.createRotationMatrix = function(axis, theta) {
    var mat = [];

    if(axis == 'x') {
        mat = [
            1, 0, 0, 0,
            0, Math.cos(toRadians(theta)), -Math.sin(toRadians(theta)), 0,
            0, Math.sin(toRadians(theta)), Math.cos(toRadians(theta)), 0,
            0, 0, 0, 1
        ];
    } else if(axis == 'y') {
        mat = [
            Math.cos(toRadians(theta)), 0, Math.sin(toRadians(theta)), 0,
            0, 1, 0, 0,
            -Math.sin(toRadians(theta)), 0, Math.cos(toRadians(theta)), 0,
            0, 0, 0, 1
        ];
    } else if(axis == 'z') {
        mat = [
            Math.cos(toRadians(theta)), -Math.sin(toRadians(theta)), 0, 0,
            Math.sin(toRadians(theta)), Math.cos(toRadians(theta)), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }

    return new Mat4x4(mat);
}

function mult4x4by4x4(mat1, mat2) {
    //get blank matrix
    var nmat = [];

    for(var i = 0; i < 4; i++) { //get row
        for(var j = 0; j < 4; j++) { //get column
            //total for 'dot' product
            var total = 0;
            for(var k = 0; k < 4; k++) { //iterate through values
                //grab values to multiply to get total
                var v1 = mat1.matrix[(i * 4) + k];
                var v2 = mat2.matrix[(j * 4) + k];

                total += v1 * v2;
            }
            //add total to matrix
            nmat.push(total);
        }
    }

    return new Mat4x4(nmat);
}

function Mat1x4(mat) {
    if(mat === undefined) {
        this.matrix = [0, 0, 0, 0];
    } else {
        this.matrix = mat;
    }
}

Mat1x4.prototype.setMatrix = function(mat) {
    this.matrix = mat;
}

Mat1x4.prototype.add1x4 = function(mat) {
    this.matrix[0] += mat.matrix[0];
    this.matrix[1] += mat.matrix[1];
    this.matrix[2] += mat.matrix[2];
    this.matrix[3] += mat.matrix[3];
}

function multScalar(mat, s) {
    for(var i = 0; i < mat.matrix.length; i++) {
        mat.matrix[i] *= s;
    }
}

function mult1x4by4x4(m1x4, m4x4) {
    var n = new Mat1x4();

    for(var i = 0; i < 4; i++) {
        var val = 0;
        for(var j = 0; j < 4; j++) {
            var q = m1x4.matrix[j];
            var w = m4x4.matrix[(i * 4) + j];
            val += q * w;
        }
        n.matrix[i] = val;
    }

    return n;
}

/**
 *      CODE FOR BASIC RASTERIZATION
 */
function isPointInTriangle(x, y, tri) {
    let poly = tri.getMatrices();
    let num = 3;
    let i = 0;
    let j = num - 1;
    let c = false;

    for(;i < 3; i++) {
        if(((poly[i][1] > y) != (poly[j][1] > y)) && ((x < poly[i][0] + (poly[j][0] - poly[i][0]) * (y - poly[i][1]) / (poly[j][1] - poly[i][1])))) {
            c = !c;
        }
        j = i;
    }

    return c;
}


/**
 * GENERAL UTILITIES
 */
function toRadians(degrees) {
    return degrees / 180 * Math.PI;
}
