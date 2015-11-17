syntax on
set tabstop=4
set autoindent
set expandtab
set shiftwidth=4
set number ruler
set laststatus=2
set wildmenu
set showcmd
set hlsearch
set hidden
set smartindent
set smarttab

augroup numberwidth
    autocmd!
    autocmd BufEnter,WinEnter,BufWinEnter * let &l:numberwidth = len(line("$")) + 2
augroup END

" ウィンドウの幅より長い行は折り返して、次の行に続けて表示する
set wrap

" 全角スペースの表示
highlight ZenkakuSpace cterm=underline ctermfg=lightblue guibg=darkgray
match ZenkakuSpace /　/

" 改行コードの自動認識
set fileformats=unix,dos,mac

" バックスペースキーで削除できるものを指定
set backspace=indent,eol,start

set nocompatible
filetype off

" fishをshでの実行に変更
if $SHELL =~ 'fish'
    set shell=/bin/sh
endif

if has('vim_starting')
    set runtimepath+=~/.vim/bundle/neobundle.vim/
endif

call neobundle#begin(expand('~/.vim/bundle'))

NeoBundle 'Townk/vim-autoclose'
NeoBundle 'mattn/emmet-vim'
NeoBundle 'sickill/vim-monokai'
NeoBundle 'Shougo/unite.vim'
NeoBundle 'ujihisa/unite-colorscheme'
NeoBundle 'scrooloose/syntastic'
NeoBundle 'crusoexia/vim-monokai'
NeoBundle 'itchyny/lightline.vim'
NeoBundleLazy 'Shougo/vimfiler.vim', {
\ 'depends' : ["Shougo/unite.vim"],
\ 'autoload' : {
\   'commands' : [ "VimFilerTab", "VimFiler", "VimFilerExplorer", "VimFilerBufferDir" ],
\   'mappings' : ['<Plug>(vimfiler_switch)'],
\   'explorer' : 1,
\ }}
NeoBundle 'elzr/vim-json'
NeoBundleLazy 'tpope/vim-endwise', { 'autoload' : { 'insert' : 1, } }
NeoBundle 'tpope/vim-surround'
NeoBundle 'vim-scripts/matchit.zip'
NeoBundle 'nathanaelkane/vim-indent-guides'
NeoBundle 'bronson/vim-trailing-whitespace'
NeoBundle 'Shougo/neosnippet.vim'
NeoBundle 'Shougo/neosnippet-snippets'
NeoBundle 'Shougo/neocomplete.vim'

" html
NeoBundle 'hail2u/vim-css3-syntax'
NeoBundle 'othree/html5.vim'

" Javascript
NeoBundle 'pangloss/vim-javascript'

" CSS
NeoBundle 'lilydjwg/colorizer'

call neobundle#end()

filetype plugin indent on
NeoBundleCheck

set background=dark
set t_Co=256

" colorschemeの設定
let g:molokai_original=1
let g:rehash256=1
colorscheme monokai
