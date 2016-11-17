"use strict";

function extend(obj, ext) {
    var keys = Object.keys(obj);
    Object.keys(ext).forEach(function(k) {
        obj[k] = ext[k];
    });
    return obj;
}

function rightpad(s, n, c) {
    while (s.length < n) {
        s += c;
    }
    return s;
}

function toFixedString(x, n) {
    return  isFinite(x) && x != Math.floor(x)
        ? x.toFixed(n)
        : x.toString();
}

// TODO:
// * Matrix.print(A, "*", B);
// |1 2| * |3 4|
// |3 4|   |5 6|
// |4 5|
//
// * Allow matrix/vector in matrices
// [A y] [x]

///////////////////////////////////

// p = O + v
//
// linear transformation laws
//    f(x+y) = f(x) + f(y)
//    f(ax) = af(x)
// or simply
//    f(ax+y) = af(x) + f(x)
//
// f(v) = xf(u0) + yf(u1) + zf(u2)
// f(v) = x[a, b, c] + y[e, f, g] + z[h, i, j]
//
// | a e h ||x|
// | b f i ||y|
// | c g j ||z|
//
// f(p) = f(O) + f(v)
// f(p) = [p,q,r] + x[a, b, c] + y[e, f, g] + z[h, i, j]
//
// |A  y| |x| = |Ax + y|
// |0  1| |1|   |0 + 1 |
//
// | 1 0 0 dx | |x|
// | 0 1 0 dy | |y|
// | 0 0 1 dz | |z|
// | 0 0 0 1  | |1|

function Matrix(n, m) {
    this.data = [];
    this.rows = n;
    this.cols = m;
}

// args format
// Matrix.new(3,
//      [1,2,3,
//      4,5,6,
//      7,8,9]
// )
// * null or undefined is used as a separator
// * in the example, the resulting matrix will be 3x3
Matrix.new = function() {
    var data = arguments;
    if (!data[0].length)
        throw "invalid matrix";
    var cols = data[0].length
    var rows = data.length;
    var m = new Matrix(rows, cols);

    m.data = [];
    for (var i = 0; i < data.length; i++) {
        if (!data[i] || data[i].length != cols)
            throw "invalid matrix";
        m.data = m.data.concat(data[i]);
    }
    return m;
}

Matrix.newBlock = function(/* rows */) {
    var rowSize = [];
    var colSize = [];

    // TODO:
    // traverse the diagonal
    // expand based on the elements of diagonals
    // fail if there are inconsistencies

    for (var i = 0; i < arguments.length; i++) {
    }
}

Matrix.newRow = function(/* x, y, z, ... */) {
     return new Matrix(1, arguments.length).init(arguments);
}

Matrix.newCol = function(/* x, y, z, ... */) {
     return new Matrix(arguments.length, 1).init(arguments);
}

Matrix.convert = function(obj) {
    var compNames = ["x", "y", "z"];
    var data = [];
    for (var i = 0; i < compNames.length; i++) {
        var k = compNames[i];
        data.push(obj[k] || 0);
    }
    return Matrix.newCol.apply(null, data);
}

Matrix.identity = function(n) {
    var m = new Matrix(n, n).zero();
    for (var i = 0; i < n; i++)
        m.set(i, i, 1);
    return m;
}

Matrix.str = function(/* args ... */) {
    var strs = [];
    var maxrow = 0;
    var maxcol = [];

    for (var i = 0; i < arguments.length; i++) {
        var lines = arguments[i].toString().split("\n");
        var col = i;

        maxrow = Math.max(lines.length, maxrow);

        for (var j = 0; j < maxrow; j++) {
            if (!strs[j])
                strs[j] = [];

            if (!maxcol[col])
                maxcol[col] = 0;
            maxcol[col] = Math.max(lines.length, maxcol[col]);

            if (lines[j] == null)
                lines[j] = "";
            strs[j][col] = rightpad(lines[j], maxcol[col], " ");
        }
    }

    var output = "";
    for (var i = 0; i < strs.length; i++) {
        for (var j = 0; j < strs[i].length; j++) {
            if (strs[i][j] != null)
                output += strs[i][j] + " ";
        }
        output += "\n";
    }
    return output.trim()+"\n";
}

Matrix.prototype = {
    constructor: Matrix,
    dataSize: function() {
        return this.rows * this.cols;
    },

    idx: function(i, j) {
        return i*this.cols + j;
    },

    rc: function(n) {
        return {
            i: n/this.cols,
            j: n%this.cols,
        };
    },

    get: function(i, j) {
        return this.data[this.idx(i, j)];
    },

    set: function(i, j, x) {
        return this.data[this.idx(i, j)] = x;
    },

    isVector: function() {
        return this.rows == 1 || this.cols == 1;
    },

    isScalar: function() {
        return this.data.length == 1;
    },

    indices: function(fn) {
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                fn(i, j);
            }
        }
    },

    each: function(fn) {
        var self = this;
        this.indices(function(i, j) {
            fn(self.get(i, j), i, j);
        });
        return this;
    },

    map: function(fn) {
        var m = this.copy();
        this.each(function(x, i, j) {
            m.set(i, j, fn(x, i, j));
        });
        return m;
    },

    normalize: function() {
        var len = this.length();
        len = len == 0 ? 1 : len;
        return this.map(function(x) {
            return x/len;
        });
    },

    zero: function() {
        return this.copy().map(function() { return 0; });
    },

    init: function(data) {
        if (data.length < this.dataSize()) {
            throw "insufficient data length";
        }
        var self = this;
        this.each(function(x, i, j) {
            var x = data[self.idx(i, j)];
            self.set(i, j, x);
        });
        return this;
    },

    copy: function() {
        var data = [];
        for (var i = 0; i < this.dataSize(); i++)
            data.push(this.data[i]);
        var m = new Matrix(this.rows, this.cols);
        m.data = data;
        return m;
    },

    conformableForAdd: function(A) {
        return this.rows == A.rows &&
             this.cols == A.cols;
    },
    conformableForMul: function(A) {
        return this.cols == A.rows;
    },

    scale: function(n) {
        return this.map(function(x) {
            return n * x;
        });
    },

    add: function(A) {
        if (!this.conformableForAdd(A))
            throw "matrix: not conformable for addition";
        return this.map(function(x, i, j) {
            return x + A.get(i, j);
        });
    },

    sub: function(A) {
        return this.add(A.scale(-1));
    },

    mul: function(B) {
        if (!this.conformableForMul(B))
            throw "matrix: not conformable for multiplication";

        var A = this;
        var n = this.cols; // or B.rows

        return new Matrix(this.rows, B.cols)
            .map(function(_, i, j) {
                var sum = 0;
                for (var k = 0; k < n; k++) {
                    sum += A.get(i, k) * B.get(k, j);
                }
                return sum;
            });
    },

    transpose: function() {
        var self = this;
        var M = new Matrix(this.cols, this.rows);
        return M.map(function(_, i, j) {
            return self.get(j, i);
        });
    },

    length: function() {
        var sum = 0;
        this.each(function(x) {
            sum += x*x;
        });
        return Math.sqrt(sum);
    },

    dot: function(A) {
        if (!this.conformableForAdd(A))
            throw "incompatible vectors, cannot perform dot product";

        var n = 0;
        var self = this;
        this.each(function(_, i, j) {
            n += self.get(i, j) * A.get(i, j);
        });
        return n;
    },

    crossOut: function(i, j) {
        var data = [];
        this.each(function(x, a, b) {
            if (a != i && b != j)
                data.push(x);
        });
        var rows = this.rows-1;
        var cols = this.cols-1;
        var m = new Matrix(rows, cols);
        m.data = data;
        return m;
    },

    determinant: function() {
        if (this.isScalar())
            return this.data[0];
        var i = 0;
        var n = 0;
        for (var j = 0; j < this.rows; j++) {
            var d = this.crossOut(i, j).determinant();
            n += this.get(i,j) * Math.pow(-1, i+j) * d;
        }
        return n;
    },

    toString: function() {
        if (this.data.length == 1)
            return "["+this.data[0]+"]";
        var str = "";
        var cols = this.cols;
        var maxw = 0;

        this.each(function(x) {
            var s = toFixedString(x, 2);
            maxw = Math.max(maxw, s.length);
        });

        this.each(function(x, i, j) {
            var s = toFixedString(x, 2);
            s = rightpad(s, maxw, " ");
            if (j == 0) {
                s = "|"+s+" ";
            } else {
                s = s+" ";
            }
            if (j == cols-1) {
                // remove one space at the right end
                s = s.slice(0, s.length-1)+"|\n";
            }
            str += s;
        });
        return str;
    },

    toHTML: function() {
        var html = "";
        html += "<table class='matrix' border='0'>";
        var cols = this.cols;
        this.each(function(x, i, j) {
            if (j == 0) {
                html += "<tr><td>"+x+"</td>";
            } else if (j == cols-1) {
                html += "<td>"+x+"</td></tr>";
            } else {
                html += "<td>"+x+"</td>";
            }
        });
        html += "</table>";
        return html;
    },

    getX: function() { return this.data[0]; },
    getY: function() { return this.data[1]; },
    getZ: function() { return this.data[2]; },
}

var affine = {
    //vector: function(/* args */) {
    //    var data = Array.prototype.slice.call(arguments);
    //    return Matrix.new(data);
    //},
    vector: Matrix.newCol,
    matrix: Matrix.new,
    convert: Matrix.convert,
    str: Matrix.str,

    eachPoints: function(p0, p1, fn, step) {
        step = step || 1;
        var v = p1.sub(p0).normalize();
        var len = p1.sub(p0).length();

        for (var t = 0; t <= len; t+=step) {
            var pt = p0.add(v.scale(t));
            fn(pt, t);
        }
    },

    print: function() {
        console.log(Matrix.str.apply(null, arguments));
    }
}

try {
    module.exports = affine;
} catch (e) { }

