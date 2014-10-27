use strict;
my $pass = $ARGV[0];
my $encPw = $ARGV[1];

my $encryptedPw =  crypt($pass,$encPw);

print $encryptedPw;
