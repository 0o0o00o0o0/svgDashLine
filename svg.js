class svgFont {
    constructor(dom, message, config) {
        this.dom = dom;
        this.message = message || '';
        this.config = config || {}
        this.init()
    }
    init() {
        if (!this.dom) {
            return;
        }
        this.dom.innerHTML = this.get();
    }
    get() {
        return `  
        <svg width='100%' height='100%'>
        <text y="${this.config.y || '80%'}" fill="transparent" stroke="${this.config.color || 'red'}" style="font-size: ${this.config.fontSize || 50}px;font-weight:${this.config.fontWeight || 600}">
        ${this.message}
        <animate attributeName="stroke-dasharray" attributeType="XML" from="0% 100%" to="100% 0" begin="0s" dur="${this.config.time || 2}s"
            ${this.config.repeate ? 'repeatCount="indefinite"' : ''} />
    </text></svg>`
    }
}
class svgdashArray {
    constructor(dom1, dom2, config) {
        this.dom1 = dom1;
        this.dom2 = dom2;
        this.config = config;
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;
        this.config = config || {};
        this.dasharray = this.config.dasharray || '5';
        this.offset = this.config.offset || 8;
        this.f = this.config.direction || 'lr'; // 'lr'//'td'
        this.init();
    }
    init() {
        if (this.dom1 && this.dom2) {
            this.computer()
        } else {
            return;
        }
    }
    computer() {
        const dom1X = this.dom1.offsetLeft;
        const dom1Y = this.dom1.offsetTop;
        const dom1W = this.dom1.offsetWidth;
        const dom1H = this.dom1.offsetHeight;
        const dom2X = this.dom2.offsetLeft;
        const dom2Y = this.dom2.offsetTop;
        const dom2W = this.dom2.offsetWidth;
        const dom2H = this.dom2.offsetHeight;
        console.log(dom1W, dom1H, dom1Y, dom1X)
        console.log(dom2W, dom2H, dom2Y, dom2X)
        if (this.f === 'lr') {
            if (dom1X + dom1W < dom2X) {
                this.x1 = dom1X + dom1W;
                this.y1 = dom1Y + dom1H / 2;
                this.x2 = dom2X;
                this.y2 = dom2Y + dom2H / 2;
            } else if (dom2X + dom2W < dom1X) {
                this.x1 = dom2X + dom2W;
                this.y1 = dom2Y + dom2H / 2;
                this.x2 = dom1X;
                this.y2 = dom1Y + dom1H / 2;
                console.log(this.x1, this.x2, this.y1, this.y2)
            } else {
                return;
            }

        } else if (this.f === 'td') {
            if (dom1Y + dom1H < dom2Y) {
                this.x1 = dom1X + dom1W / 2;
                this.y1 = dom1Y + dom1H;
                this.x2 = dom2X + dom2W / 2;
                this.y2 = dom2Y
            } else if (dom2Y + dom2H < dom1Y) {
                this.x1 = dom2X + dom2W / 2;
                this.y1 = dom2Y + dom2H;
                this.x2 = dom1X + dom1W / 2;
                this.y2 = dom1Y
            } else {
                return
            }
        } else {
            return;
        }
        this.draw()
    }
    line() {
        if (this.f === 'lr' && this.y1 === this.y2) {
            return `L ${this.x2} ${this.y2}`
        } else if (this.f === 'lr' && this.y1 !== this.y2) {
            return `Q ${(this.x2 + this.x1) / 2} ${this.y1} , ${(this.x2 + this.x1) / 2} ${(this.y1 + this.y2) / 2} T ${this.x2} ${this.y2}`
        } else if (this.f === 'td' && this.x1 === this.x2) {
            return `L ${this.x2} ${this.y2}`
        } else if (this.f === 'td' && this.x1 !== this.x2) {
            return `Q ${this.x1} ${(this.y1 + this.y2) / 2} , ${(this.x2 + this.x1) / 2} ${(this.y1 + this.y2) / 2} T ${this.x2} ${this.y2}`
        } else {
            return `L ${this.x2} ${this.y2}`
        }
    }
    draw() {
        let svgStr = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svgStr.style = `position:absolute;left:${this.f === 'lr' ? this.x1 : Math.min(this.x1, this.x2) - (this.f === 'td' ? this.offset : 0)}px;top:${(this.f === 'td' ? this.y1 : Math.min(this.y1, this.y2)) - (this.f === 'lr' ? this.offset : 0)}px;width:${Math.abs(this.x1 - this.x2) + (this.f === 'td' ? 2 * this.offset : 0)}px;height:${Math.abs(this.y1 - this.y2) + (this.f === 'lr' ? 2 * this.offset : 0)}px`;
        svgStr.setAttribute('viewBox', `${Math.min(this.x1, this.x2) - (this.f === 'td' ? this.offset : 0)} ${Math.min(this.y1, this.y2) - (this.f === 'lr' ? this.offset : 0)} ${Math.abs(this.x1 - this.x2) + (this.f === 'td' ? this.offset : 0)} ${Math.abs(this.y1 - this.y2) + (this.f === 'lr' ? this.offset : 0)}`);
        svgStr.innerHTML =
            `<defs>
            <marker id="Triangle" viewBox="0 0 8 8" refX="8" refY="4"
                 markerWidth="5" markerHeight="5" orient="auto">
                   <path d="M 0 0 L 8 4 L 0 8 z" />
            </marker>
        </defs>
        <path fill='transparent' d='M ${this.x1} ${this.y1} ${this.line()}' stroke='${this.config.color || 'gray'}' stroke-dasharray='${this.dasharray}' stroke-width='${this.config.dashwidth || 2}' marker-end="url(#Triangle)">
           ${this.config.animate ? `<animate attributeName="stroke-dashoffset" attributeType="XML" from="${2 * this.dasharray.split(',').reduce((a, b) => +(a + b), 0)}" to="0" begin="0s" dur="${2 * this.dasharray.split(',').reduce((a, b) => +(a + b), 0) / 10}s"
                repeatCount="indefinite" />`: ''}
        </path>
        `
        document.body.appendChild(svgStr);
    }
}