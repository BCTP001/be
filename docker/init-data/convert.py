with \
    open("booktemppre.csv", 'r', encoding='utf-8') as src, \
    open("booktemp.csv", 'w', encoding='utf-8') as dest \
:
    while True:
        line = src.readline()
        if len(line) == 0:
            break
        state = False
        for c in line:
            if c == '\\':
                if state:
                    dest.write('\\')
                    state = False
                else:
                    state = True
            elif c == '/':
                dest.write('/')
                state = False
            else:
                if state:
                    exit(-2)
                else:
                    dest.write(c)
            

