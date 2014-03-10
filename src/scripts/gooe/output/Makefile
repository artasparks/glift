# $Id: Makefile 191 2007-06-02 15:31:50Z reid $
#
#       Makefile for sgf2tex/tex subdirectory.  This Makefile installs the TeX
#       portions of the sgf2tex distribution: the GOOE fonts, font metrics,
#       and TeX include files.
#


# During 'perl Makefile.PL' in the parent (sgf2tex) directory, the section
# below between the '# perl Makefile.PL auto-edit' and '# perl Makefile.PL
# auto-edit end' comments is completely deleted and rebuilt.
#
# You can override the variables by either changing the values 'perl
# Makefile.PL' put in the auto-edit section (temporary - overwritten the next
# time 'perl Makefile.PL' is run) or by adding a new definition below the
# auto-edit section (permanent - running 'perl Makefile.PL' again won't change
# anything outside the auto-edit comment tags).

# start perl Makefile.PL auto-edit

# During 'perl Makefile.PL', the following variables are determined:

# where font (*.mf) files will go:
MFDIR = unknown

# where font metric (*.tfm) files will go:
TFMDIR = unknown

# where TeX input files (gooemacs.tex and gotcmacs.tex) will go:
TEXINPUTS = unknown

# where cached fonts (GOOE/go*pk) might have been put (we need to
# remove cached fonts from previous installs):
PKFONTS = unknown

# how to install files:
INSTALL = install -m 0644

# end perl Makefile.PL auto-edit


# If you make certain types of modifications to the fonts, the .tfm files
# might change.  If you are getting checksum errors, you should delete any
# cached .tfm files. Most font modifications you are likely to make to the
# GOOE fonts are not likely to change the .tfm files.
#

.SUFFIXES : .mf .tfm .300pk .360pk .432pk .600pk .720pk .864pk .300gf .360gf .432gf .600gf .720gf .864gf

FONTS = gooa.300gf gooa.360gf gooa.432gf gooa.600gf gooa.720gf gooa.864gf \
        goea.300gf goea.360gf goea.432gf goea.600gf goea.720gf goea.864gf \
        goob.300gf goob.360gf goob.432gf goob.600gf goob.720gf goob.864gf \
        goeb.300gf goeb.360gf goeb.432gf goeb.600gf goeb.720gf goeb.864gf \
        gooc.300gf gooc.360gf gooc.432gf gooc.600gf gooc.720gf gooc.864gf \
        goec.300gf goec.360gf goec.432gf goec.600gf goec.720gf goec.864gf \
        good.300gf good.360gf good.432gf good.600gf good.720gf good.864gf \
        goed.300gf goed.360gf goed.432gf goed.600gf goed.720gf goed.864gf \
        gobl.300gf gobl.360gf gobl.432gf gobl.600gf gobl.720gf gobl.864gf \
        gowl.300gf gowl.360gf gowl.432gf gowl.600gf gowl.720gf gowl.864gf \
        gooegb.300gf gooegb.360gf gooegb.432gf gooegb.600gf gooegb.720gf gooegb.864gf \
        gooemt.300gf gooemt.360gf gooemt.432gf gooemt.600gf gooemt.720gf gooemt.864gf \
        gooa.300pk gooa.360pk gooa.432pk gooa.600pk gooa.720pk gooa.864pk \
        goea.300pk goea.360pk goea.432pk goea.600pk goea.720pk goea.864pk \
        goob.300pk goob.360pk goob.432pk goob.600pk goob.720pk goob.864pk \
        goeb.300pk goeb.360pk goeb.432pk goeb.600pk goeb.720pk goeb.864pk \
        gooc.300pk gooc.360pk gooc.432pk gooc.600pk gooc.720pk gooc.864pk \
        goec.300pk goec.360pk goec.432pk goec.600pk goec.720pk goec.864pk \
        good.300pk good.360pk good.432pk good.600pk good.720pk good.864pk \
        goed.300pk goed.360pk goed.432pk goed.600pk goed.720pk goed.864pk \
        gooegb.300pk gooegb.360pk gooegb.432pk gooegb.600pk gooegb.720pk gooegb.864pk \
        gooemt.300pk gooemt.360pk gooemt.432pk gooemt.600pk gooemt.720pk gooemt.864pk

# when called as 'make' or 'make all', we don't want anything to happen:
make: all

all:

# After installing fonts, we need to run MakeTeXls-R for WEB2C Unix
# distribution, or texhash for TETEX, or nothing for NTEX.  Since we don't
# know what our distribution is, we'll just try texhash and then MakeTeXls-R
# (with the '-' in front so make doesn't choke if the command isn't there)
install:
	rm -f $(PKFONTS)
	- mkdir $(MFDIR)
	$(INSTALL) *.mf $(MFDIR)
	- mkdir $(TFMDIR)
	$(INSTALL) *.tfm $(TFMDIR)
	$(INSTALL) gooemacs.tex gotcmacs.tex $(TEXINPUTS)
	- texhash
	- MakeTeXls-R

# The preferred method of installation is just to copy the metafont sources
# and tfm files into appropriated directories in MakeTeXPK's search path. The
# required pk fonts will be then built automatically by the system. In an
# emergency, you can build the fonts by hand with `make -f Makefile.tex
# fonts'. This might be appropriate if (for example) you are working on a
# machine where you do not have superuser privileges, or if you are working on
# a DOS port.

fonts: $(FONTS)

.mf.300gf :
	mf "\mode=cx; mag=1; input $*"

.mf.360gf :
	mf "\mode=cx; mag=1.2; input $*"

.mf.432gf :
	mf "\mode=cx; mag=1.44; input $*"

.mf.600gf :
	mf "\mode=ljfour; mag=1; input $*"

.mf.720gf :
	mf "\mode=ljfour; mag=1.2; input $*"

.mf.864gf :
	mf "\mode=ljfour; mag=1.44; input $*"

.300gf.300pk :
	gftopk $*.300gf

.360gf.360pk :
	gftopk $*.360gf

.432gf.432pk :
	gftopk $*.432gf

.600gf.600pk :
	gftopk $*.600gf

.720gf.720pk :
	gftopk $*.720gf

.864gf.864pk :
	gftopk $*.864gf

.300pk.tfm :

